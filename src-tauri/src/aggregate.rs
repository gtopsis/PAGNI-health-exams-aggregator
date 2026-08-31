//! Pure aggregation logic over `HealthData`: adding and removing reports.
//!
//! No I/O, no framework dependencies — fully unit-testable. Ported from the
//! legacy `ipcEventsHandlers.ts` / `PDFHealthDataExtractor.ts` (Electron era),
//! with the sequential-ID-reuse defect fixed by using ULIDs.

use ulid::Ulid;

use crate::domain::{HealthData, MedicalReport, Measurement, UploadedFileMetadata};

/// Build a new report from parsed data. Exposed for testing/wiring; the
/// parser pipeline (`commands`) supplies `date` + `measurements`.
pub fn build_report(
    file: &UploadedFileMetadata,
    date: Option<String>,
    measurements: Vec<(String, Measurement)>,
) -> MedicalReport {
    MedicalReport {
        id: Ulid::new().to_string(),
        path: file.path.clone(),
        name: file.name.clone(),
        date,
        measurements,
    }
}

/// True when a report with this file path has already been processed.
pub fn is_duplicate(data: &HealthData, path: &str) -> bool {
    data.reports.iter().any(|r| r.path == path)
}

/// Insert a fully-parsed report. Returns `false` (and changes nothing) when
/// the report's path was already processed.
pub fn add_report(data: &mut HealthData, report: MedicalReport) -> bool {
    if is_duplicate(data, &report.path) {
        return false;
    }
    data.reports.push(report);
    true
}

/// Remove a report (and therefore all of its measurements) by id.
/// Returns `true` when a report was actually removed.
pub fn remove_report(data: &mut HealthData, report_id: &str) -> bool {
    let before = data.reports.len();
    data.reports.retain(|r| r.id != report_id);
    data.reports.len() != before
}

/// Remove every report and all aggregated data.
pub fn clear(data: &mut HealthData) {
    data.reports.clear();
}

#[cfg(test)]
mod tests {
    use super::*;

    fn file(path: &str) -> UploadedFileMetadata {
        UploadedFileMetadata {
            path: path.to_string(),
            name: path.rsplit('/').next().unwrap_or(path).to_string(),
        }
    }

    fn measurement(value: f64) -> Measurement {
        Measurement {
            value,
            unit: String::new(),
            ref_range: None,
        }
    }

    #[test]
    fn generated_report_ids_are_unique() {
        let a = build_report(&file("a.pdf"), None, vec![]);
        let b = build_report(&file("a.pdf"), None, vec![]);
        assert_ne!(a.id, b.id);
    }

    #[test]
    fn add_report_appends_and_aggregates_measurements() {
        let mut data = HealthData::default();
        let report = build_report(
            &file("dir/f1.pdf"),
            Some("2023-04-05".into()),
            vec![("HCT".into(), measurement(40.6))],
        );

        assert!(add_report(&mut data, report));
        assert_eq!(data.reports.len(), 1);
        assert_eq!(data.reports[0].measurements.len(), 1);
        assert_eq!(data.reports[0].date.as_deref(), Some("2023-04-05"));
    }

    #[test]
    fn add_report_rejects_duplicate_paths() {
        // Ported from legacy spec: "will try to process a new medical report
        // when this one has already been processed".
        let mut data = HealthData::default();
        assert!(add_report(&mut data, build_report(&file("dir/myfilename.pdf"), None, vec![])));

        let duplicate = build_report(&file("dir/myfilename.pdf"), None, vec![]);
        assert!(!add_report(&mut data, duplicate));
        assert_eq!(data.reports.len(), 1);
    }

    #[test]
    fn remove_report_deletes_report_and_its_measurements() {
        let mut data = HealthData::default();
        let r1 = build_report(&file("f1.pdf"), None, vec![("HCT".into(), measurement(40.6))]);
        let r2 = build_report(&file("f2.pdf"), None, vec![("HCT".into(), measurement(49.1))]);
        let id1 = r1.id.clone();
        add_report(&mut data, r1);
        add_report(&mut data, r2);

        assert!(remove_report(&mut data, &id1));
        assert_eq!(data.reports.len(), 1);
        assert!(data.reports.iter().all(|r| r.id != id1));
        assert_eq!(data.reports[0].measurements[0].1.value, 49.1);
    }

    #[test]
    fn remove_report_with_unknown_id_changes_nothing() {
        let mut data = HealthData::default();
        add_report(&mut data, build_report(&file("f1.pdf"), None, vec![]));
        let snapshot = data.clone();

        assert!(!remove_report(&mut data, "nonexistent-id"));
        assert_eq!(data, snapshot);
    }

    #[test]
    fn removing_a_report_does_not_break_future_ids() {
        // Regression test for the legacy sequential-ID-reuse bug: removing a
        // report must not cause a future report to collide with existing ids.
        let mut data = HealthData::default();
        let r1 = build_report(&file("f1.pdf"), None, vec![("HCT".into(), measurement(1.0))]);
        let r2 = build_report(&file("f2.pdf"), None, vec![("HCT".into(), measurement(2.0))]);
        let id1 = r1.id.clone();
        let id2 = r2.id.clone();
        add_report(&mut data, r1);
        add_report(&mut data, r2);
        remove_report(&mut data, &id1);

        let r3 = build_report(&file("f3.pdf"), None, vec![("HCT".into(), measurement(3.0))]);
        let id3 = r3.id.clone();
        add_report(&mut data, r3);

        assert_ne!(id2, id3);
        assert_eq!(data.reports.len(), 2);
    }

    #[test]
    fn clear_empties_everything() {
        let mut data = HealthData::default();
        add_report(&mut data, build_report(&file("f1.pdf"), None, vec![]));
        clear(&mut data);
        assert!(data.reports.is_empty());
    }
}
