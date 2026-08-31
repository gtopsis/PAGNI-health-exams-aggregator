/**
 * Catalog of the medical tests recognized in PAGNI blood-test reports.
 * The stable `code` is the aggregation key; `label` is the Greek text as
 * printed on the hospital's PDFs (used for display).
 */
export interface MedicalTest {
  code: string;
  label: string;
}

export const MEDICAL_TESTS: readonly MedicalTest[] = [
  { code: "WBC", label: "WBC  Λευκά αιμοσφ." },
  { code: "Ne", label: "Ne Ουδετερόφιλα" },
  { code: "Ly", label: "Ly Λεμφοκύτταρα" },
  { code: "Mo", label: "Mo Μονοκύτταρα" },
  { code: "Eos", label: "Eos Ηωσινόφιλα" },
  { code: "Bas", label: "Bas Βασεόφιλα" },
  { code: "RBC", label: "RBC Ερυθρά αιμοσφαίρια" },
  { code: "HGB", label: "HGB Αιμοσφαιρίνη" },
  { code: "HCT", label: "HCT Αιματοκρίτης" },
  { code: "MCV", label: "MCV Μέσος όγκος" },
  { code: "MCH", label: "MCH Μέση περ.Hb" },
  { code: "MCHC", label: "MCHC Μέση πυκνότητα" },
  { code: "RDW", label: "RDW Εύρος καταν.ερυθρ." },
  { code: "PLT", label: "PLT Αιμοπετάλια" },
  { code: "MPV", label: "MPV Μέσος όγκος αιμοπεταλίων" },
  { code: "PCT", label: "PCT Αιμοπεταλιοκρίτης" },
  { code: "PDW", label: "PDW Εύρος κατανομής" },
] as const;

const byCode = new Map(MEDICAL_TESTS.map((t) => [t.code, t]));

/** Display label for a test code, falling back to the raw code. */
export function labelForCode(code: string): string {
  return byCode.get(code)?.label ?? code;
}

/** All known test codes. */
export function allTestCodes(): string[] {
  return MEDICAL_TESTS.map((t) => t.code);
}
