//! Pure domain model shared across the whole backend.
//!
//! These types are intentionally plain, JSON-serializable structs so they can
//! cross the IPC boundary (Tauri commands) and be persisted as-is.

use serde::{Deserialize, Serialize};

/// Unique, time-sortable identifier of a medical report (ULID string).
pub type ReportId = String;

/// A single measured value of a medical test inside one report.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Measurement {
    /// Numeric value of the test result.
    pub value: f64,
    /// Measurement unit as printed on the report (may be empty).
    #[serde(default)]
    pub unit: String,
    /// Reference range printed next to the result, when present.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub ref_range: Option<RefRange>,
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct RefRange {
    pub min: f64,
    pub max: f64,
}

/// One medical report = one PDF file from a single hospital visit.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct MedicalReport {
    pub id: ReportId,
    pub path: String,
    pub name: String,
    /// ISO-8601 date (YYYY-MM-DD) extracted from the report, when found.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub date: Option<String>,
    /// Measurements found in this report, keyed by medical test code (e.g. "HCT").
    #[serde(default)]
    pub measurements: Vec<(String, Measurement)>,
}

/// Aggregate of every parsed report.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
pub struct HealthData {
    pub reports: Vec<MedicalReport>,
}

/// Metadata of a file selected by the user, before parsing.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct UploadedFileMetadata {
    pub path: String,
    pub name: String,
}
