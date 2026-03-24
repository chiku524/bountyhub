#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::Write;
use std::net::{TcpListener, TcpStream};
use std::sync::mpsc;
use std::thread;
use std::time::Duration;
use tauri::menu::{MenuBuilder, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{include_image, Emitter, LogicalPosition, LogicalSize, Manager, WebviewWindow};

const WINDOW_LABEL_MAIN: &str = "main";
const WINDOW_LABEL_SPLASH: &str = "splashscreen";
/// Localhost port for single-instance handoff (second launch pings first to raise the window).
const INSTANCE_PORT: u16 = 45287;

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
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
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

            let _tray = TrayIconBuilder::with_id("bountyhub-tray")
                .icon_as_template(true)
                .icon(include_image!("icons/icon.png"))
                .menu(&tray_menu)
                .show_menu_on_left_click(false)
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "open" => focus_bountyhub_windows(&app),
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
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == WINDOW_LABEL_MAIN {
                    let _ = window.hide();
                    api.prevent_close();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running BountyHub");
}
