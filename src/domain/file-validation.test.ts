import { describe, it, expect } from "vitest";
import { validatePdfFiles } from "./file-validation";

describe("validatePdfFiles", () => {
  it("accepts a valid pdf within the size limit", () => {
    const files = [{ name: "report.pdf", sizeMb: 1.5 }];
    expect(validatePdfFiles(files, 5)).toEqual({ valid: ["report.pdf"], errors: [] });
  });

  it("rejects files over the size limit", () => {
    const files = [{ name: "big.pdf", sizeMb: 6 }];
    const result = validatePdfFiles(files, 5);
    expect(result.valid).toEqual([]);
    expect(result.errors[0]).toMatch(/big\.pdf/);
    expect(result.errors[0]).toMatch(/5\s*MB/i);
  });

  it("rejects non-pdf extensions", () => {
    const files = [{ name: "notes.txt", sizeMb: 1 }];
    const result = validatePdfFiles(files, 5);
    expect(result.valid).toEqual([]);
    expect(result.errors[0]).toMatch(/notes\.txt/);
  });

  it("accepts uppercase .PDF extension", () => {
    const files = [{ name: "SCAN.PDF", sizeMb: 1 }];
    expect(validatePdfFiles(files, 5).valid).toEqual(["SCAN.PDF"]);
  });

  it("splits valid and invalid files in one batch", () => {
    const files = [
      { name: "ok.pdf", sizeMb: 1 },
      { name: "bad.png", sizeMb: 1 },
      { name: "huge.pdf", sizeMb: 99 },
    ];
    const result = validatePdfFiles(files, 5);
    expect(result.valid).toEqual(["ok.pdf"]);
    expect(result.errors).toHaveLength(2);
  });
});
