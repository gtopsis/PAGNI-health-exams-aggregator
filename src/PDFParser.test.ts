import {
  extractHealthDataFromPDF,
  extractHealthDataFromPDFs,
} from "./PDFParser";
import pdfParser from "pdf-parse";
import { readdirSync } from "fs";

jest.mock("fs", () => {
  return {
    readFileSync: jest.fn(),
    readdirSync: jest.fn(),
  };
});

jest.mock("pdf-parse");

describe("Extract health data of a single file", () => {
  it("will return no data when the file content is empty", async () => {
    (pdfParser as jest.Mock).mockResolvedValueOnce({ text: "" });

    const result = await extractHealthDataFromPDF("test_filename");

    expect(result).not.toEqual(undefined);
    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(0);
  });

  it("will return no data when the file content has no health terms", async () => {
    (pdfParser as jest.Mock).mockResolvedValueOnce({
      text: `
        78,7BBB test
        25,1CCC test.Hb
    `,
    });

    const result = await extractHealthDataFromPDF("test_filename");

    expect(result).not.toEqual(undefined);
    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(0);
  });

  it("will return last occurence of HCT when the file content has multiple occurences of the health term HCT", async () => {
    (pdfParser as jest.Mock).mockResolvedValueOnce({
      text: `
        78,7BBB test
        40,6HCT Αιματοκρίτης 40-52%
        25,1CCC test.Hb
        11,3HCT Αιματοκρίτης 40-52%
        25,1CCC test.Hb
    `,
    });

    const result = await extractHealthDataFromPDF("test_filename");

    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(1);
    expect(result.get("HCT Αιματοκρίτης")).toEqual(11.3);
  });

  it("will return health data for HCT when the file content has valid term and value for HCT", async () => {
    (pdfParser as jest.Mock).mockResolvedValueOnce({
      text: `
        12,9AAA Αιμοσφαιρίνη  14-18g/dl
        40,6HCT Αιματοκρίτης 40-52%
        78,7BBB Μέσος όγκος
        25,1CCC Μέση περ.Hb
    `,
    });

    const result = await extractHealthDataFromPDF("test_filename");

    expect(result).not.toEqual(undefined);
    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(1);
    expect(result.get("HCT Αιματοκρίτης")).toEqual(40.6);
  });
});

describe("Extract health data of multiple files", () => {
  it("will return a single value fro HCT when only one of the file contains valid data for HCT", async () => {
    (readdirSync as jest.Mock).mockReturnValueOnce(["file1", "file2"]);
    (pdfParser as jest.Mock).mockResolvedValueOnce({
      text: "",
    });
    (pdfParser as jest.Mock).mockResolvedValueOnce({
      text: `
        12,9AAA Αιμοσφαιρίνη  14-18g/dl
        40,6HCT Αιματοκρίτης 40-52%
    `,
    });

    const result = await extractHealthDataFromPDFs();

    expect(result).not.toEqual(undefined);
    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(17);
    expect(result.get("HCT Αιματοκρίτης")).toHaveLength(1);
    expect(result.get("HCT Αιματοκρίτης")?.[0]).toEqual({
      file: "file2",
      healthTermValue: 40.6,
    });
  });

  it("will return a two values for HCT and one for MCHC when two files contain valid data for HCT and MCHC", async () => {
    (readdirSync as jest.Mock).mockReturnValueOnce(["file1", "file2"]);
    (pdfParser as jest.Mock).mockResolvedValueOnce({
      text: `
      12,9AAA Αιμοσφαιρίνη  14-18g/dl
      49,1HCT Αιματοκρίτης 52%
      25,9MCHC Μέση πυκνότητα
    `,
    });
    (pdfParser as jest.Mock).mockResolvedValueOnce({
      text: `
        12,9AAA Αιμοσφαιρίνη  14-18g/dl
        40,6HCT Αιματοκρίτης 40-52%
    `,
    });

    const result = await extractHealthDataFromPDFs();

    expect(result).not.toEqual(undefined);
    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(17);
    expect(result.get("HCT Αιματοκρίτης")).toHaveLength(2);
    expect(result.get("HCT Αιματοκρίτης")).toEqual([
      {
        file: "file1",
        healthTermValue: 49.1,
      },
      {
        file: "file2",
        healthTermValue: 40.6,
      },
    ]);
    expect(result.get("MCHC Μέση πυκνότητα")).toHaveLength(1);
    expect(result.get("MCHC Μέση πυκνότητα")?.[0]).toEqual({
      file: "file1",
      healthTermValue: 25.9,
    });
  });
});
