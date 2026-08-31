pub mod aggregate;
pub mod catalog;
pub mod commands;
pub mod domain;
pub mod parser;
pub mod store;

use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .manage(commands::AppState::default())
        .invoke_handler(tauri::generate_handler![
            commands::parse_reports,
            commands::remove_report,
            commands::clear_all,
            commands::load_initial,
        ])
        .setup(|app| {
            // Load persisted data into memory at startup.
            let stored = store::load(&app.handle()).unwrap_or_default();
            let state = app.state::<commands::AppState>();
            *state.0.lock().expect("state poisoned") = stored;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
