//! Tauri commands: the thin IPC-facing layer.
//!
//! Commands hold the app's `HealthData` state, orchestrate
//! parse → aggregate → persist, and return the updated aggregate to the
//! frontend. All real logic lives in the pure `parser`/`aggregate` modules.

use std::sync::Mutex;

use tauri::{AppHandle, Manager, State};

use crate::aggregate::{self, build_report};
use crate::domain::{HealthData, ReportId, UploadedFileMetadata};
use crate::parser::{extract_measurements, extract_report_date, extract_text};
use crate::store;

/// Shared, mutable application state.
pub struct AppState(pub Mutex<HealthData>);

impl Default for AppState {
    fn default() -> Self {
        Self(Mutex::new(HealthData::default()))
    }
}

fn persist(app: &AppHandle, data: &HealthData) {
    if let Err(e) = store::save(app, data) {
        eprintln!("failed to persist health data: {e}");
    }
}

fn file_metadata(path: &str) -> UploadedFileMetadata {
    let name = std::path::Path::new(path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or(path)
        .to_string();
    UploadedFileMetadata {
        path: path.to_string(),
        name,
    }
}

/// Parse newly selected PDF reports and merge them into the aggregate.
#[tauri::command]
pub fn parse_reports(
    app: AppHandle,
    state: State<AppState>,
    paths: Vec<String>,
) -> HealthData {
    let mut data = state.0.lock().expect("state poisoned");

    for path in paths {
        // Skip files that were already processed.
        if aggregate::is_duplicate(&data, &path) {
            eprintln!("skipping already-processed file: {path}");
            continue;
        }

        let metadata = file_metadata(&path);
        let report = match extract_text(&path) {
            Ok(text) => build_report(
                &metadata,
                extract_report_date(&text),
                extract_measurements(&text),
            ),
            Err(e) => {
                eprintln!("{e}");
                // Still register the file (with no data) so it is listed and
                // not silently re-attempted on every launch.
                build_report(&metadata, None, Vec::new())
            }
        };

        aggregate::add_report(&mut data, report);
    }

    persist(&app, &data);
    data.clone()
}

/// Remove one report (and its measurements) by id.
#[tauri::command]
pub fn remove_report(app: AppHandle, state: State<AppState>, report_id: ReportId) -> HealthData {
    let mut data = state.0.lock().expect("state poisoned");
    aggregate::remove_report(&mut data, &report_id);
    persist(&app, &data);
    data.clone()
}

/// Remove every report and all persisted data.
#[tauri::command]
pub fn clear_all(app: AppHandle, state: State<AppState>) -> HealthData {
    let mut data = state.0.lock().expect("state poisoned");
    aggregate::clear(&mut data);
    persist(&app, &data);
    data.clone()
}

/// Load the persisted aggregate on startup.
#[tauri::command]
pub fn load_initial(app: AppHandle, state: State<AppState>) -> HealthData {
    let stored = store::load(&app).unwrap_or_default();
    let mut data = state.0.lock().expect("state poisoned");
    *data = stored;
    data.clone()
}
