import { invoke } from "@tauri-apps/api/core";
import type { HealthData, MedicalReport, Measurement, ReportId } from "../domain/types";
import { healthDataSchema } from "./schemas";

/** Convert the snake_case wire format from Rust into the domain camelCase. */
function toDomainHealthData(raw: unknown): HealthData {
  const parsed = healthDataSchema.parse(raw);
  return {
    reports: parsed.reports.map(
      (r): MedicalReport => ({
        id: r.id,
        path: r.path,
        name: r.name,
        ...(r.date !== undefined ? { date: r.date } : {}),
        measurements: r.measurements.map(
          ([code, m]): [string, Measurement] => [
            code,
            {
              value: m.value,
              unit: m.unit,
              ...(m.ref_range !== undefined
                ? { refRange: { min: m.ref_range.min, max: m.ref_range.max } }
                : {}),
            },
          ]
        ),
      })
    ),
  };
}

/** Parse newly selected PDF reports and merge them into the aggregate. */
export async function parseReports(paths: string[]): Promise<HealthData> {
  const raw = await invoke("parse_reports", { paths });
  return toDomainHealthData(raw);
}

/** Remove one report (and its measurements) from the aggregate. */
export async function removeReport(id: ReportId): Promise<HealthData> {
  const raw = await invoke("remove_report", { reportId: id });
  return toDomainHealthData(raw);
}

/** Remove every report and all persisted data. */
export async function clearAll(): Promise<HealthData> {
  const raw = await invoke("clear_all");
  return toDomainHealthData(raw);
}

/** Load the persisted aggregate on startup. */
export async function loadInitial(): Promise<HealthData> {
  const raw = await invoke("load_initial");
  return toDomainHealthData(raw);
}
