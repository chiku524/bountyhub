#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::Write;
use std::net::{TcpListener, TcpStream};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc;
use std::thread;
use std::time::Duration;
use tauri::image::Image;
use tauri::menu::{MenuBuilder, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{include_image, Emitter, LogicalPosition, LogicalSize, Manager, WebviewWindow};

const WINDOW_LABEL_MAIN: &str = "main";
const WINDOW_LABEL_SPLASH: &str = "splashscreen";
const TRAY_ID: &str = "bountyhub-tray";
/// Tray icon (generated from public/logo.svg by `npm run desktop:icons`).
const TRAY_ICON: Image<'static> = include_image!("icons/icon.png");
/// Badge colour drawn on the tray icon / Windows taskbar overlay when there are unread notifications.
const BADGE_RGB: [u8; 3] = [0xEF, 0x44, 0x44];
/// Localhost port for single-instance handoff (second launch pings first to raise the window).
const INSTANCE_PORT: u16 = 45287;

/// Whether closing the main window hides it to the tray (default) or quits the app.
/// The webview sets this from Settings → Desktop app on startup and whenever it changes.
static CLOSE_TO_TRAY: AtomicBool = AtomicBool::new(true);

#[tauri::command]
fn set_close_to_tray(enabled: bool) {
    CLOSE_TO_TRAY.store(enabled, Ordering::Relaxed);
}

/// Draws a filled circle (with a white ring) into an RGBA buffer, anti-aliased at the edges.
#[cfg_attr(target_os = "macos", allow(dead_code))]
fn draw_badge_dot(rgba: &mut [u8], width: u32, height: u32, cx: f32, cy: f32, radius: f32) {
    let ring = (radius * 0.18).max(1.0);
    for y in 0..height {
        for x in 0..width {
            let dx = x as f32 + 0.5 - cx;
            let dy = y as f32 + 0.5 - cy;
            let d = (dx * dx + dy * dy).sqrt();
            let outer = (radius + ring + 0.5 - d).clamp(0.0, 1.0);
            if outer <= 0.0 {
                continue;
            }
            let inner = (radius + 0.5 - d).clamp(0.0, 1.0);
            // Fill colour: red inside, white ring outside it.
            let fill = [
                BADGE_RGB[0] as f32 * inner + 255.0 * (1.0 - inner),
                BADGE_RGB[1] as f32 * inner + 255.0 * (1.0 - inner),
                BADGE_RGB[2] as f32 * inner + 255.0 * (1.0 - inner),
            ];
            let i = ((y * width + x) * 4) as usize;
            let a = outer;
            for c in 0..3 {
                rgba[i + c] = (fill[c] * a + rgba[i + c] as f32 * (1.0 - a)).round() as u8;
            }
            rgba[i + 3] = (255.0 * a + rgba[i + 3] as f32 * (1.0 - a)).round() as u8;
        }
    }
}

/// The tray icon with a red dot in the top-right corner, signalling unread notifications.
#[cfg(not(target_os = "macos"))]
fn tray_icon_with_badge() -> Image<'static> {
    let (w, h) = (TRAY_ICON.width(), TRAY_ICON.height());
    let mut rgba = TRAY_ICON.rgba().to_vec();
    let r = w.min(h) as f32 * 0.18;
    draw_badge_dot(&mut rgba, w, h, w as f32 - r * 1.1, r * 1.1, r);
    Image::new_owned(rgba, w, h)
}

/// A small standalone red dot, used as the Windows taskbar overlay icon.
#[cfg(target_os = "windows")]
fn overlay_badge() -> Image<'static> {
    let size = 32u32;
    let mut rgba = vec![0u8; (size * size * 4) as usize];
    let c = size as f32 / 2.0;
    draw_badge_dot(&mut rgba, size, size, c, c, c * 0.8);
    Image::new_owned(rgba, size, size)
}

/// Last unread count pushed to the tray, so repeated polls with the same count don't redraw the icon.
static UNREAD_COUNT: std::sync::atomic::AtomicU32 = std::sync::atomic::AtomicU32::new(0);

/// Reflects the unread notification count in the OS chrome: tray tooltip on every platform, a count
/// next to the menu-bar icon on macOS, a red dot on the tray icon on Windows/Linux (the macOS icon is a
/// monochrome template, so it gets the count instead), the dock badge on macOS / launcher badge on
/// Linux, and a taskbar overlay dot on Windows.
#[tauri::command]
fn set_unread_count(app: tauri::AppHandle, count: u32) -> Result<(), String> {
    if UNREAD_COUNT.swap(count, Ordering::Relaxed) == count {
        return Ok(());
    }
    let label = match count {
        0 => None,
        1..=99 => Some(count.to_string()),
        _ => Some("99+".to_string()),
    };

    if let Some(tray) = app.tray_by_id(TRAY_ID) {
        let tooltip = match &label {
            Some(l) => format!("BountyHub \u{2014} {l} unread"),
            None => "BountyHub".to_string(),
        };
        let _ = tray.set_tooltip(Some(tooltip));
        #[cfg(target_os = "macos")]
        {
            let _ = tray.set_title(label.as_deref());
        }
        #[cfg(not(target_os = "macos"))]
        {
            let icon = if count > 0 {
                tray_icon_with_badge()
            } else {
                TRAY_ICON.clone()
            };
            let _ = tray.set_icon(Some(icon));
        }
    }

    if let Some(win) = app.get_webview_window(WINDOW_LABEL_MAIN) {
        #[cfg(target_os = "windows")]
        {
            let _ = win.set_overlay_icon(if count > 0 {
                Some(overlay_badge())
            } else {
                None
            });
        }
        #[cfg(not(target_os = "windows"))]
        {
            let _ = win.set_badge_count(if count > 0 { Some(count as i64) } else { None });
        }
    }
    Ok(())
}

/// Returns current window logical size and position for persistence.
#[tauri::command]
fn get_window_state(window: WebviewWindow) -> Result<serde_json::Value, String> {
    let scale = window.scale_factor().unwrap_or(1.0);
    let inner = window.inner_size().map_err(|e| e.to_string())?;
    let pos = window.outer_position().map_err(|e| e.to_string())?;
    let width = (inner.width as f64 / scale).round() as u32;
    let height = (inner.height as f64 / scale).round() as u32;
    let x = (pos.x as f64 / scale).round() as i32;
    let y = (pos.y as f64 / scale).round() as i32;
    Ok(serde_json::json!({
        "width": width,
        "height": height,
        "x": x,
        "y": y
    }))
}

/// Restores window to the given logical size and position.
#[tauri::command]
fn set_window_state(
    window: WebviewWindow,
    width: u32,
    height: u32,
    x: i32,
    y: i32,
) -> Result<(), String> {
    window
        .set_size(LogicalSize { width, height })
        .map_err(|e| e.to_string())?;
    window
        .set_position(LogicalPosition { x, y })
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Returns the app version from package info (for About dialog).
#[tauri::command]
fn get_app_version(app: tauri::AppHandle) -> String {
    app.package_info().version.to_string()
}

/// Brings splash (if still open) or main window to the foreground — used when user launches a second instance.
#[tauri::command]
fn focus_bountyhub(app: tauri::AppHandle) -> Result<(), String> {
    focus_bountyhub_windows(&app);
    Ok(())
}

/// Opens WebView developer tools (debug builds only; no-op in release).
#[tauri::command]
fn open_devtools(window: WebviewWindow) -> Result<(), String> {
    #[cfg(debug_assertions)]
    {
        window.open_devtools();
    }
    #[cfg(not(debug_assertions))]
    drop(window);
    Ok(())
}

/// Closes the frameless splash window and shows the main app window.
#[tauri::command]
fn close_splash_and_show_main(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(splash) = app.get_webview_window(WINDOW_LABEL_SPLASH) {
        splash.close().map_err(|e| e.to_string())?;
    }
    if let Some(main_win) = app.get_webview_window(WINDOW_LABEL_MAIN) {
        main_win.show().map_err(|e| e.to_string())?;
        main_win.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn focus_bountyhub_windows(app: &tauri::AppHandle) {
    if let Some(w) = app.get_webview_window(WINDOW_LABEL_SPLASH) {
        let _ = w.show();
        let _ = w.set_focus();
        return;
    }
    if let Some(w) = app.get_webview_window(WINDOW_LABEL_MAIN) {
        let _ = w.unminimize();
        let _ = w.show();
        let _ = w.set_focus();
    }
}

fn ping_running_instance() {
    for _ in 0..30 {
        if let Ok(mut s) = TcpStream::connect(("127.0.0.1", INSTANCE_PORT)) {
            let _ = s.write_all(b"focus\n");
            let _ = s.flush();
            return;
        }
        thread::sleep(Duration::from_millis(100));
    }
}

fn main() {
    let listener = match TcpListener::bind(("127.0.0.1", INSTANCE_PORT)) {
        Ok(l) => l,
        Err(_) => {
            ping_running_instance();
            std::process::exit(0);
        }
    };
    let _ = listener.set_nonblocking(true);

    let (tx_ipc, rx_ipc) = mpsc::channel::<()>();

    thread::spawn(move || loop {
        match listener.accept() {
            Ok((_stream, _)) => {
                let _ = tx_ipc.send(());
            }
            Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                thread::sleep(Duration::from_millis(120));
            }
            Err(_) => thread::sleep(Duration::from_millis(200)),
        }
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .setup(move |app| {
            if let Some(w) = app.get_webview_window(WINDOW_LABEL_MAIN) {
                let _ = w.center();
            }

            let handle = app.handle().clone();
            let rx = rx_ipc;
            thread::spawn(move || {
                while rx.recv().is_ok() {
                    let h = handle.clone();
                    let _ = h.emit("instance-focus", true);
                }
            });

            let tray_menu = MenuBuilder::new(app)
                .item(&MenuItem::with_id(
                    app,
                    "open",
                    "Open BountyHub",
                    true,
                    None::<&str>,
                )?)
                .separator()
                .item(&MenuItem::with_id(
                    app,
                    "settings",
                    "Settings…",
                    true,
                    None::<&str>,
                )?)
                .item(&MenuItem::with_id(
                    app,
                    "reload_tray",
                    "Reload",
                    true,
                    None::<&str>,
                )?)
                .separator()
                .item(&MenuItem::with_id(
                    app,
                    "about",
                    "About BountyHub",
                    true,
                    None::<&str>,
                )?)
                .item(&MenuItem::with_id(
                    app,
                    "check_updates",
                    "Check for Updates",
                    true,
                    None::<&str>,
                )?)
                .separator()
                .item(&MenuItem::with_id(
                    app,
                    "sign_out",
                    "Log out",
                    true,
                    None::<&str>,
                )?)
                .separator()
                .item(&MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?)
                .build()?;

            // icon.png is generated from public/logo.svg (npm run desktop:icons). Template images are for
            // macOS menu bar; Windows/Linux tray should use the full-color app icon.
            let _tray = TrayIconBuilder::with_id(TRAY_ID)
                .icon_as_template(cfg!(target_os = "macos"))
                .icon(TRAY_ICON.clone())
                .tooltip("BountyHub")
                .menu(&tray_menu)
                .show_menu_on_left_click(false)
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "open" => focus_bountyhub_windows(app),
                    "settings" => {
                        let _ = app.emit("menu-preferences", ());
                    }
                    "reload_tray" => {
                        let _ = app.emit("menu-reload", ());
                    }
                    "about" => {
                        let _ = app.emit("menu-about", ());
                    }
                    "check_updates" => {
                        let _ = app.emit("menu-check-updates", ());
                    }
                    "sign_out" => {
                        let _ = app.emit("menu-logout", ());
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        focus_bountyhub_windows(tray.app_handle());
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            close_splash_and_show_main,
            focus_bountyhub,
            get_window_state,
            set_window_state,
            get_app_version,
            open_devtools,
            set_close_to_tray,
            set_unread_count,
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == WINDOW_LABEL_MAIN {
                    if CLOSE_TO_TRAY.load(Ordering::Relaxed) {
                        let _ = window.hide();
                        api.prevent_close();
                        // Lets the webview tell the user (once) that BountyHub is still running in the tray.
                        let _ = window.emit("window-hidden-to-tray", ());
                    } else {
                        window.app_handle().exit(0);
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running BountyHub");
}
