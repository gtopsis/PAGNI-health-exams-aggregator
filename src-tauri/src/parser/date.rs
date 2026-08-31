//! Extraction of the report reception date from raw PDF text.
//!
//! PAGNI reports carry the date as `Ημ/νία παραλαβής:DD/MM/YYYY`
//! ("date received" in Greek). We normalize it to ISO-8601 (`YYYY-MM-DD`)
//! so it is unambiguous, sortable and timezone-free.

use regex::Regex;
use std::sync::LazyLock;

static DATE_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"Ημ/νία παραλαβής:\s*(\d{1,2})/(\d{1,2})/(\d{4})").expect("valid regex")
});

/// Extract the report date from raw text, returning it as ISO `YYYY-MM-DD`.
/// Returns `None` when the marker or a valid calendar date is absent.
pub fn extract_report_date(text: &str) -> Option<String> {
    let caps = DATE_RE.captures(text)?;
    let day: u32 = caps[1].parse().ok()?;
    let month: u32 = caps[2].parse().ok()?;
    let year: i32 = caps[3].parse().ok()?;

    let date = chrono::NaiveDate::from_ymd_opt(year, month, day)?;
    Some(date.format("%Y-%m-%d").to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn returns_none_when_text_is_empty() {
        assert_eq!(extract_report_date(""), None);
    }

    #[test]
    fn returns_none_when_date_is_incomplete() {
        // Ported from legacy spec: "Ημ/νία παραλαβής:05/04/" is invalid.
        let text = "
            Ημ/νία παραλαβής:05/04/
            40,6HCT Αιματοκρίτης 40-52%
        ";
        assert_eq!(extract_report_date(text), None);
    }

    #[test]
    fn returns_none_when_month_is_out_of_range() {
        let text = "Ημ/νία παραλαβής:05/13/2023";
        assert_eq!(extract_report_date(text), None);
    }

    #[test]
    fn returns_none_when_day_is_out_of_range() {
        let text = "Ημ/νία παραλαβής:32/05/2023";
        assert_eq!(extract_report_date(text), None);
    }

    #[test]
    fn parses_valid_date_to_iso_format() {
        let text = "Ημ/νία παραλαβής:05/04/2023";
        assert_eq!(extract_report_date(text), Some("2023-04-05".to_string()));
    }

    #[test]
    fn parses_date_without_zero_padding() {
        let text = "Ημ/νία παραλαβής:5/4/2023";
        assert_eq!(extract_report_date(text), Some("2023-04-05".to_string()));
    }

    #[test]
    fn finds_date_among_other_text() {
        let text = "
            ΠΑΓΝΗ - Αιματολογικό Εργαστήριο
            Ημ/νία παραλαβής:11/05/2023
            40,6HCT Αιματοκρίτης 40-52%
        ";
        assert_eq!(extract_report_date(text), Some("2023-05-11".to_string()));
    }

    #[test]
    fn rejects_impossible_calendar_date() {
        // 31st of February does not exist.
        let text = "Ημ/νία παραλαβής:31/02/2023";
        assert_eq!(extract_report_date(text), None);
    }

    #[test]
    fn accepts_leap_day() {
        let text = "Ημ/νία παραλαβής:29/02/2024";
        assert_eq!(extract_report_date(text), Some("2024-02-29".to_string()));
    }
}
