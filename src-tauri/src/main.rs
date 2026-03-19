#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use single_instance::SingleInstance;
use tauri::{
    CustomMenuItem, Manager, Menu, Submenu, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem,
};
use tauri::LogicalPosition;
use tauri::LogicalSize;

const WINDOW_LABEL_MAIN: &str = "main";

/// Returns current window logical size and position for persistence.
#[tauri::command]
fn get_window_state(window: tauri::Window) -> Result<serde_json::Value, String> {
    let scale = window.scale_factor().unwrap_or(1.0);
    let inner = window
        .inner_size()
        .ok_or_else(|| "inner_size".to_string())?;
    let pos = window
        .outer_position()
        .ok_or_else(|| "outer_position".to_string())?;
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

fn build_app_menu() -> Menu {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let file = Submenu::new(
        "File",
        Menu::new()
            .add_item(quit),
    );
    let preferences = CustomMenuItem::new("preferences".to_string(), "Preferences…");
    let edit = Submenu::new(
        "Edit",
        Menu::new()
            .add_item(preferences),
    );
    let about = CustomMenuItem::new("about".to_string(), "About BountyHub");
    let check_updates = CustomMenuItem::new("check_updates".to_string(), "Check for Updates");
    let help = Submenu::new(
        "Help",
        Menu::new()
            .add_item(about)
            .add_item(check_updates),
    );
    Menu::new()
        .add_submenu(file)
        .add_submenu(edit)
        .add_submenu(help)
}

fn main() {
    // Ensure only one instance of the app is running; second launch exits.
    let instance = SingleInstance::new("tech.bountyhub.desktop").expect("single-instance init");
    if !instance.is_single() {
        std::process::exit(0);
    }
    let _guard = instance; // keep the lock for the process lifetime

    let open = CustomMenuItem::new("open".to_string(), "Open BountyHub");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(open)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);
    let app_menu = build_app_menu();

    tauri::Builder::default()
        .menu(app_menu)
        .on_menu_event(|app, event| {
            match event.menu_item_id() {
                "quit" => {
                    std::process::exit(0);
                }
                "preferences" => {
                    let _ = app.emit_all("menu-preferences", ());
                }
                "about" => {
                    let _ = app.emit_all("menu-about", ());
                }
                "check_updates" => {
                    let _ = app.emit_all("menu-check-updates", ());
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_window_state,
            set_window_state,
            get_app_version,
        ])
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                if let Some(w) = app.get_window(WINDOW_LABEL_MAIN) {
                    let _ = w.show();
                    let _ = w.set_focus();
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "open" => {
                    if let Some(w) = app.get_window(WINDOW_LABEL_MAIN) {
                        let _ = w.show();
                        let _ = w.set_focus();
                    }
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
                event.window().hide().ok();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running BountyHub");
}
