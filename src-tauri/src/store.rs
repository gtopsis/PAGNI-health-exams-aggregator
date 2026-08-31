//! Persistence of the aggregate `HealthData` via `tauri-plugin-store`.
//!
//! Local-only storage (privacy-first): a single JSON document under the
//! app-local data directory. No network access of any kind.

use tauri::{AppHandle, Runtime};
use tauri_plugin_store::StoreExt;

use crate::domain::HealthData;

const STORE_PATH: &str = "health-data.json";
const STORE_KEY: &str = "health_data";

/// Persist the aggregate to disk.
pub fn save<R: Runtime>(app: &AppHandle<R>, data: &HealthData) -> Result<(), String> {
    let store = app.store(STORE_PATH).map_err(|e| e.to_string())?;
    let value = serde_json::to_value(data).map_err(|e| e.to_string())?;
    store.set(STORE_KEY, value);
    store.save().map_err(|e| e.to_string())
}

/// Load the persisted aggregate, or `None` when absent/unreadable.
pub fn load<R: Runtime>(app: &AppHandle<R>) -> Option<HealthData> {
    let store = app.store(STORE_PATH).ok()?;
    let value = store.get(STORE_KEY)?;
    serde_json::from_value(value).ok()
}
