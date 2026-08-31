import { describe, it, expect } from "vitest";
import { MEDICAL_TESTS, labelForCode, allTestCodes } from "./medical-test";

describe("medical-test catalog", () => {
  it("contains the full PAGNI CBC panel", () => {
    const codes = allTestCodes();
    for (const expected of ["WBC", "HCT", "HGB", "PLT", "MCHC", "RBC"]) {
      expect(codes).toContain(expected);
    }
    expect(MEDICAL_TESTS.length).toBe(17);
  });

  it("every entry has a non-empty code and label", () => {
    for (const t of MEDICAL_TESTS) {
      expect(t.code.length).toBeGreaterThan(0);
      expect(t.label.length).toBeGreaterThan(0);
    }
  });

  it("labelForCode returns the Greek display label", () => {
    expect(labelForCode("HCT")).toBe("HCT Αιματοκρίτης");
  });

  it("labelForCode falls back to the raw code for unknown codes", () => {
    expect(labelForCode("UNKNOWN")).toBe("UNKNOWN");
  });

  it("allTestCodes returns every code", () => {
    expect(allTestCodes()).toHaveLength(MEDICAL_TESTS.length);
    expect(allTestCodes()[0]).toBe("WBC");
  });
});
