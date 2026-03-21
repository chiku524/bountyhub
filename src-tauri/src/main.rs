#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::Write;
use std::net::{TcpListener, TcpStream};
use std::sync::mpsc;
use std::thread;
use std::time::Duration;
use tauri::{
    CustomMenuItem, Manager, Menu, MenuItem, Submenu, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem,
};
use tauri::LogicalPosition;
use tauri::LogicalSize;

const WINDOW_LABEL_MAIN: &str = "main";
const WINDOW_LABEL_SPLASH: &str = "splashscreen";
/// Localhost port for single-instance handoff (second launch pings first to raise the window).
const INSTANCE_PORT: u16 = 45287;

/// Returns current window logical size and position for persistence.
#[tauri::command]
fn get_window_state(window: tauri::Window) -> Result<serde_json::Value, String> {
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
    window: tauri::Window,
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
fn open_devtools(window: tauri::Window) -> Result<(), String> {
    #[cfg(debug_assertions)]
    window.open_devtools();
    #[cfg(not(debug_assertions))]
    drop(window);
    Ok(())
}

/// Closes the frameless splash window and shows the main app window.
#[tauri::command]
fn close_splash_and_show_main(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(splash) = app.get_window(WINDOW_LABEL_SPLASH) {
        splash.close().map_err(|e| e.to_string())?;
    }
    if let Some(main_win) = app.get_window(WINDOW_LABEL_MAIN) {
        main_win.show().map_err(|e| e.to_string())?;
        main_win.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn focus_bountyhub_windows(app: &tauri::AppHandle) {
    if let Some(w) = app.get_window(WINDOW_LABEL_SPLASH) {
        let _ = w.show();
        let _ = w.set_focus();
        return;
    }
    if let Some(w) = app.get_window(WINDOW_LABEL_MAIN) {
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

fn build_window_menu() -> Menu {
    let file_about = CustomMenuItem::new("file_about", "About BountyHub");
    let prefs = CustomMenuItem::new("prefs", "Preferences…").accelerator("CmdOrControl+,");
    let quit = CustomMenuItem::new("quit_menu", "Quit").accelerator("CmdOrControl+Q");
    let reload = CustomMenuItem::new("reload_win", "Reload").accelerator("CmdOrControl+R");
    let about = CustomMenuItem::new("about_menu", "About BountyHub");
    let check_updates = CustomMenuItem::new("check_updates_menu", "Check for Updates…");

    let file = Submenu::new(
        "File",
        Menu::new()
            .add_item(file_about)
            .add_native_item(MenuItem::Separator)
            .add_item(prefs)
            .add_native_item(MenuItem::Separator)
            .add_item(quit),
    );
    #[cfg(debug_assertions)]
    let view = Submenu::new(
        "View",
        Menu::new()
            .add_item(reload)
            .add_item(
                CustomMenuItem::new("dev_tools", "Toggle Developer Tools")
                    .accelerator("CmdOrControl+Shift+I"),
            ),
    );
    #[cfg(not(debug_assertions))]
    let view = Submenu::new("View", Menu::new().add_item(reload));
    let help = Submenu::new(
        "Help",
        Menu::new()
            .add_item(about)
            .add_native_item(MenuItem::Separator)
            .add_item(check_updates),
    );

    Menu::new()
        .add_submenu(file)
        .add_submenu(view)
        .add_submenu(help)
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

    thread::spawn(move || {
        loop {
            match listener.accept() {
                Ok((_stream, _)) => {
                    let _ = tx_ipc.send(());
                }
                Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                    thread::sleep(Duration::from_millis(120));
                }
                Err(_) => thread::sleep(Duration::from_millis(200)),
            }
        }
    });

    let open = CustomMenuItem::new("open".to_string(), "Open BountyHub");
    let about = CustomMenuItem::new("about".to_string(), "About BountyHub");
    let check_updates = CustomMenuItem::new("check_updates".to_string(), "Check for Updates");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(open)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(about)
        .add_item(check_updates)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);
    let window_menu = build_window_menu();

    tauri::Builder::default()
        .menu(window_menu)
        .setup(move |app| {
            if let Some(w) = app.get_window(WINDOW_LABEL_MAIN) {
                let _ = w.center();
            }

            let handle = app.handle().clone();
            let rx = rx_ipc;
            thread::spawn(move || {
                while rx.recv().is_ok() {
                    let h = handle.clone();
                    let _ = h.emit_all("instance-focus", true);
                }
            });

            Ok(())
        })
        .on_menu_event(|event| {
            let app = event.window().app_handle();
            match event.menu_item_id() {
                "about_menu" | "file_about" => {
                    let _ = app.emit_all("menu-about", ());
                }
                "prefs" => {
                    let _ = app.emit_all("menu-preferences", ());
                }
                "check_updates_menu" => {
                    let _ = app.emit_all("menu-check-updates", ());
                }
                "reload_win" => {
                    let _ = app.emit_all("menu-reload", ());
                }
                "dev_tools" => {
                    #[cfg(debug_assertions)]
                    {
                        let _ = event.window().open_devtools();
                    }
                }
                "quit_menu" => {
                    std::process::exit(0);
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            close_splash_and_show_main,
            focus_bountyhub,
            get_window_state,
            set_window_state,
            get_app_version,
            open_devtools,
        ])
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                focus_bountyhub_windows(&app);
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "open" => {
                    focus_bountyhub_windows(&app);
                }
                "about" => {
                    let _ = app.emit_all("menu-about", ());
                }
                "check_updates" => {
                    let _ = app.emit_all("menu-check-updates", ());
                }
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .on_window_event(|event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event.event() {
                if event.window().label() == WINDOW_LABEL_MAIN {
                    event.window().hide().ok();
                    api.prevent_close();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running BountyHub");
}
