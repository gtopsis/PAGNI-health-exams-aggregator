import { describe, it, expect } from "vitest";
import {
  testCodesWithData,
  lineGraphPointsForTest,
  compareIsoDates,
} from "./health-data";
import type { HealthData } from "./types";

const data: HealthData = {
  reports: [
    {
      id: "r1",
      path: "a.pdf",
      name: "a.pdf",
      date: "2023-05-11",
      measurements: [
        ["HCT", { value: 49.1, unit: "%" }],
        ["MCHC", { value: 25.9, unit: "g/dl" }],
      ],
    },
    {
      id: "r2",
      path: "b.pdf",
      name: "b.pdf",
      date: "2023-04-05",
      measurements: [["HCT", { value: 40.6, unit: "%" }]],
    },
    {
      id: "r3",
      path: "c.pdf",
      name: "c.pdf",
      // No date parsed for this one.
      measurements: [["HCT", { value: 30.0, unit: "%" }]],
    },
  ],
};

describe("testCodesWithData", () => {
  it("returns sorted unique codes that have at least one measurement", () => {
    expect(testCodesWithData(data)).toEqual(["HCT", "MCHC"]);
  });

  it("returns empty for no reports", () => {
    expect(testCodesWithData({ reports: [] })).toEqual([]);
  });
});

describe("lineGraphPointsForTest", () => {
  it("maps measurements to graph points using the report date", () => {
    const points = lineGraphPointsForTest(data, "HCT");
    expect(points).toHaveLength(3);
  });

  it("sorts points by date ascending without mutating input", () => {
    const before = JSON.stringify(data);
    const points = lineGraphPointsForTest(data, "HCT");
    expect(points[0]).toEqual({ date: "2023-04-05", value: 40.6 });
    expect(points[1]).toEqual({ date: "2023-05-11", value: 49.1 });
    // Undated report goes last (stable, not dropped).
    expect(points[2]).toEqual({ date: undefined, value: 30.0 });
    expect(JSON.stringify(data)).toEqual(before);
  });

  it("returns empty when the test has no measurements", () => {
    expect(lineGraphPointsForTest(data, "WBC")).toEqual([]);
  });

  it("returns empty when there are no reports", () => {
    expect(lineGraphPointsForTest({ reports: [] }, "HCT")).toEqual([]);
  });
});

describe("compareIsoDates", () => {
  it("orders two valid dates", () => {
    expect(compareIsoDates("2023-04-05", "2023-05-11")).toBeLessThan(0);
    expect(compareIsoDates("2023-05-11", "2023-04-05")).toBeGreaterThan(0);
    expect(compareIsoDates("2023-04-05", "2023-04-05")).toBe(0);
  });

  it("treats undefined as greater than any defined date", () => {
    expect(compareIsoDates(undefined, "2023-04-05")).toBeGreaterThan(0);
    expect(compareIsoDates("2023-04-05", undefined)).toBeLessThan(0);
    expect(compareIsoDates(undefined, undefined)).toBe(0);
  });
});
