import type { HealthData, LineGraphPoint } from "./types";

/**
 * Sorted, de-duplicated list of test codes that have at least one
 * measurement across all reports.
 */
export function testCodesWithData(data: HealthData): string[] {
  const codes = new Set<string>();
  for (const report of data.reports) {
    for (const [code] of report.measurements) {
      codes.add(code);
    }
  }
  return [...codes].sort();
}

/**
 * Compare two optional ISO dates for sorting. Undefined dates sort last.
 * Returns a negative/positive/zero comparator value.
 */
export function compareIsoDates(
  a: string | undefined,
  b: string | undefined
): number {
  if (a === undefined && b === undefined) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Build the plottable points for one test code, sorted by report date
 * ascending (undated reports last). Does not mutate `data`.
 */
export function lineGraphPointsForTest(
  data: HealthData,
  testCode: string
): LineGraphPoint[] {
  const points: LineGraphPoint[] = [];

  for (const report of data.reports) {
    for (const [code, measurement] of report.measurements) {
      if (code !== testCode) continue;
      points.push({ date: report.date, value: measurement.value });
    }
  }

  return [...points].sort((p1, p2) => compareIsoDates(p1.date, p2.date));
}
