/** Unique, time-sortable identifier of a medical report (ULID). */
export type ReportId = string;

/** Reference range printed next to a result, when present. */
export interface RefRange {
  min: number;
  max: number;
}

/** A single measured value of a medical test inside one report. */
export interface Measurement {
  value: number;
  unit: string;
  refRange?: RefRange;
}

/** One medical report = one PDF file from a single hospital visit. */
export interface MedicalReport {
  id: ReportId;
  path: string;
  name: string;
  /** ISO-8601 date (YYYY-MM-DD), when the parser found one. */
  date?: string;
  /** Measurements keyed by medical test code (e.g. "HCT"). */
  measurements: Array<[string, Measurement]>;
}

/** Aggregate of every parsed report — mirrors the Rust `HealthData`. */
export interface HealthData {
  reports: MedicalReport[];
}

/** A plottable point on the per-test line graph. */
export interface LineGraphPoint {
  /** ISO date of the report this value came from (may be undefined). */
  date: string | undefined;
  value: number;
}

/** Metadata of a file selected by the user, before parsing. */
export interface UploadedFileMetadata {
  path: string;
  name: string;
}
