//! Extraction of medical test measurements from raw PDF text.
//!
//! A measurement line on a PAGNI report looks like:
//!   `40,6HCT Αιματοκρίτης 40-52%`
//! i.e. `<value><label> [<min>-<max>][unit]` where the decimal separator of
//! the value is a comma. Behavior is ported from the legacy
//! `getMedicaTestsResultsFromText` (Electron era); unlike the legacy version
//! we also retain the unit and the reference range.

use std::sync::LazyLock;

use regex::Regex;

use crate::catalog::{find_by_label, MEDICAL_TESTS};
use crate::domain::{Measurement, RefRange};

const NUMBER: &str = r"\d+(?:,\d+)?";

static LINE_RE: LazyLock<Regex> = LazyLock::new(|| {
    let labels = MEDICAL_TESTS
        .iter()
        .map(|t| regex::escape(t.label))
        .collect::<Vec<_>>()
        .join("|");
    // value, label, optional (range), optional unit
    Regex::new(&format!(
        r"(?P<value>{NUMBER})\s*(?P<label>{labels})\D*(?P<range>{NUMBER}-{NUMBER})?\s*(?P<unit>\S*)"
    ))
    .expect("valid regex")
});

fn parse_greek_number(raw: &str) -> Option<f64> {
    raw.replace(',', ".").parse().ok()
}

/// Extract all recognized measurements from raw report text.
///
/// Returns one measurement per medical test code. If a test appears multiple
/// times in the same report, the last occurrence wins (legacy behavior).
pub fn extract_measurements(text: &str) -> Vec<(String, Measurement)> {
    let mut results: Vec<(String, Measurement)> = Vec::new();

    for caps in LINE_RE.captures_iter(text) {
        let (Some(value_m), Some(label_m)) = (caps.name("value"), caps.name("label")) else {
            continue;
        };
        let Some(test) = find_by_label(label_m.as_str()) else {
            continue;
        };
        let Some(value) = parse_greek_number(value_m.as_str()) else {
            continue;
        };

        let ref_range = caps.name("range").and_then(|r| {
            let mut parts = r.as_str().split('-');
            let min = parse_greek_number(parts.next()?)?;
            let max = parse_greek_number(parts.next()?)?;
            Some(RefRange { min, max })
        });

        let unit = caps
            .name("unit")
            .map(|u| u.as_str().trim().to_string())
            .unwrap_or_default();

        let measurement = Measurement {
            value,
            unit,
            ref_range,
        };

        // Last occurrence of a test within one report wins.
        if let Some(existing) = results.iter_mut().find(|(code, _)| code == test.code) {
            existing.1 = measurement;
        } else {
            results.push((test.code.to_string(), measurement));
        }
    }

    results
}

#[cfg(test)]
mod tests {
    use super::*;

    fn get<'a>(results: &'a [(String, Measurement)], code: &str) -> Option<&'a Measurement> {
        results.iter().find(|(c, _)| c == code).map(|(_, m)| m)
    }

    #[test]
    fn returns_nothing_when_text_is_empty() {
        assert!(extract_measurements("").is_empty());
    }

    #[test]
    fn returns_nothing_when_no_known_test_is_present() {
        // Ported from legacy spec.
        let text = "
            78,7BBB test
            25,1CCC test.Hb
        ";
        assert!(extract_measurements(text).is_empty());
    }

    #[test]
    fn ignores_incomplete_entries() {
        // Ported from legacy spec: garbled label, missing value.
        let text = "
            Ημ/νία παραλαβής:05/04/2023
            12,9AAA Αιμοσφαιρίνη  14-18g/dl
            40,6HCT ΑιματοΧΧΧΧ 52%
            25,1MCHC Μέση πυκνότητα
        ";
        let results = extract_measurements(text);
        assert_eq!(results.len(), 1);
        assert!(get(&results, "HCT").is_none());
        assert_eq!(get(&results, "MCHC").map(|m| m.value), Some(25.1));
    }

    #[test]
    fn parses_single_valid_measurement_with_range_and_unit() {
        // Ported from legacy spec.
        let text = "
            Ημ/νία παραλαβής:05/04/2023
            12,9AAA Αιμοσφαιρίνη  14-18g/dl
            40,6HCT Αιματοκρίτης 40-52%
            78,7BBB Μέσος όγκος
            25,1CCC Μέση περ.Hb
        ";
        let results = extract_measurements(text);
        assert_eq!(results.len(), 1);
        let hct = get(&results, "HCT").expect("HCT present");
        assert_eq!(hct.value, 40.6);
        assert_eq!(
            hct.ref_range,
            Some(RefRange {
                min: 40.0,
                max: 52.0
            })
        );
        assert_eq!(hct.unit, "%");
    }

    #[test]
    fn parses_multiple_measurements_and_ignores_unknown_tests() {
        // Ported from legacy spec.
        let text = "
            Ημ/νία παραλαβής:05/04/2023
            12,9AAA Αιμοσφαιρίνη  14-18g/dl
            40,6HCT Αιματοκρίτης 40-52%
            78,7BBB Μέσος όγκος
            25,1MCHC Μέση πυκνότητα
        ";
        let results = extract_measurements(text);
        assert_eq!(results.len(), 2);
        assert_eq!(get(&results, "HCT").map(|m| m.value), Some(40.6));
        assert_eq!(get(&results, "MCHC").map(|m| m.value), Some(25.1));
    }

    #[test]
    fn last_occurrence_wins_when_test_appears_twice() {
        // Ported from legacy spec.
        let text = "
            78,7BBB test
            40,6HCT Αιματοκρίτης 40-52%
            25,1CCC test.Hb
            11,3HCT Αιματοκρίτης 40-52%
            25,1CCC test.Hb
        ";
        let results = extract_measurements(text);
        assert_eq!(results.len(), 1);
        assert_eq!(get(&results, "HCT").map(|m| m.value), Some(11.3));
    }

    #[test]
    fn measurement_without_range_still_parses() {
        let text = "49,1HCT Αιματοκρίτης 52%";
        let results = extract_measurements(text);
        let hct = get(&results, "HCT").expect("HCT present");
        assert_eq!(hct.value, 49.1);
        assert_eq!(hct.ref_range, None);
    }

    #[test]
    fn integer_values_parse() {
        let text = "5WBC  Λευκά αιμοσφ.";
        let results = extract_measurements(text);
        assert_eq!(get(&results, "WBC").map(|m| m.value), Some(5.0));
    }
}
