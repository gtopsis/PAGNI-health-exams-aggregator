//! Catalog of the medical tests the parser looks for in PAGNI blood-test
//! reports. Each test has a stable short `code` (used as the aggregation key)
//! and the exact Greek `label` as printed on the hospital's PDF reports.

/// A known medical test: stable code + label as printed on PAGNI reports.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct MedicalTest {
    pub code: &'static str,
    pub label: &'static str,
}

/// All medical tests recognized by the parser (complete blood count panel).
pub const MEDICAL_TESTS: &[MedicalTest] = &[
    MedicalTest { code: "WBC", label: "WBC  Λευκά αιμοσφ." },
    MedicalTest { code: "Ne", label: "Ne Ουδετερόφιλα" },
    MedicalTest { code: "Ly", label: "Ly Λεμφοκύτταρα" },
    MedicalTest { code: "Mo", label: "Mo Μονοκύτταρα" },
    MedicalTest { code: "Eos", label: "Eos Ηωσινόφιλα" },
    MedicalTest { code: "Bas", label: "Bas Βασεόφιλα" },
    MedicalTest { code: "RBC", label: "RBC Ερυθρά αιμοσφαίρια" },
    MedicalTest { code: "HGB", label: "HGB Αιμοσφαιρίνη" },
    MedicalTest { code: "HCT", label: "HCT Αιματοκρίτης" },
    MedicalTest { code: "MCV", label: "MCV Μέσος όγκος" },
    MedicalTest { code: "MCH", label: "MCH Μέση περ.Hb" },
    MedicalTest { code: "MCHC", label: "MCHC Μέση πυκνότητα" },
    MedicalTest { code: "RDW", label: "RDW Εύρος καταν.ερυθρ." },
    MedicalTest { code: "PLT", label: "PLT Αιμοπετάλια" },
    MedicalTest { code: "MPV", label: "MPV Μέσος όγκος αιμοπεταλίων" },
    MedicalTest { code: "PCT", label: "PCT Αιμοπεταλιοκρίτης" },
    MedicalTest { code: "PDW", label: "PDW Εύρος κατανομής" },
];

/// Look up a medical test by the exact label found in report text.
pub fn find_by_label(label: &str) -> Option<&'static MedicalTest> {
    MEDICAL_TESTS.iter().find(|t| t.label == label.trim())
}
