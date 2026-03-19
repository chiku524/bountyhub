#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use single_instance::SingleInstance;

fn main() {
    // Ensure only one instance of the app is running; second launch exits.
    let instance = SingleInstance::new("tech.bountyhub.desktop").expect("single-instance init");
    if !instance.is_single() {
        std::process::exit(0);
    }
    let _guard = instance; // keep the lock for the process lifetime

    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running BountyHub");
}
