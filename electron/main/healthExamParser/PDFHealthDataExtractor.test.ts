import pdfParser from "pdf-parse";
import {
  extractHealthDataFromPDF,
  extractHealthDataFromPDFs,
} from "./PDFHealthDataExtractor";

jest.mock("fs", () => {
  return {
    readFileSync: jest.fn(),
  };
});

jest.mock("pdf-parse");

const files = ["path/to/file1.pdf", "path/to/file2.pdf"];

describe("Extract health data of a single file", () => {
  it("will return no data when the file content is empty", async () => {
    (pdfParser as jest.Mock).mockResolvedValueOnce({ text: "" });

    const { date, result } = await extractHealthDataFromPDF("test_filename");

    expect(date).toEqual(undefined);
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

    const { date, result } = await extractHealthDataFromPDF("test_filename");

    expect(date).toEqual(undefined);
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

    const { date, result } = await extractHealthDataFromPDF("test_filename");

    expect(date).toEqual(undefined);
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

    const { date, result } = await extractHealthDataFromPDF("test_filename");

    expect(date).toEqual(undefined);
    expect(result).not.toEqual(undefined);
    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(1);
    expect(result.get("HCT Αιματοκρίτης")).toEqual(40.6);
  });
});

describe("Extract health data of multiple files", () => {
  it("will return a single value fro HCT when only one of the file contains valid data for HCT", async () => {
    (pdfParser as jest.Mock).mockResolvedValueOnce({
      text: "",
    });
    (pdfParser as jest.Mock).mockResolvedValueOnce({
      text: `
        Ημ/νία παραλαβής:05/04/2023
        12,9AAA Αιμοσφαιρίνη  14-18g/dl
        40,6HCT Αιματοκρίτης 40-52%
    `,
    });

    const { filesData, healthDataOfAllFiles } = await extractHealthDataFromPDFs(
      files
    );

    expect(filesData).not.toEqual(undefined);
    expect(filesData).toEqual([
      { fileId: 0, filePath: "path/to/file1.pdf", date: undefined },
      { fileId: 1, filePath: "path/to/file2.pdf", date: "04/05/2023" },
    ]);
    expect(healthDataOfAllFiles).not.toEqual(undefined);
    expect(healthDataOfAllFiles instanceof Map).toBeTruthy();
    expect(healthDataOfAllFiles.size).toEqual(17);
    expect(healthDataOfAllFiles.get("HCT Αιματοκρίτης")).toHaveLength(1);
    expect(healthDataOfAllFiles.get("HCT Αιματοκρίτης")?.[0]).toEqual({
      fileId: 1,
      healthTermValue: 40.6,
    });
  });

  it("will return a two values for HCT and one for MCHC when two files contain valid data for HCT and MCHC", async () => {
    (pdfParser as jest.Mock).mockResolvedValueOnce({
      text: `
      Ημ/νία παραλαβής:11/05/2023
      12,9AAA Αιμοσφαιρίνη  14-18g/dl
      49,1HCT Αιματοκρίτης 52%
      25,9MCHC Μέση πυκνότητα
    `,
    });
    (pdfParser as jest.Mock).mockResolvedValueOnce({
      text: `
        Ημ/νία παραλαβής:05/04/2023
        12,9AAA Αιμοσφαιρίνη  14-18g/dl
        40,6HCT Αιματοκρίτης 40-52%
    `,
    });

    const { filesData, healthDataOfAllFiles } = await extractHealthDataFromPDFs(
      files
    );

    expect(filesData).not.toEqual(undefined);
    expect(filesData).toEqual([
      { fileId: 0, filePath: "path/to/file1.pdf", date: "05/11/2023" },
      { fileId: 1, filePath: "path/to/file2.pdf", date: "04/05/2023" },
    ]);
    expect(healthDataOfAllFiles).not.toEqual(undefined);
    expect(healthDataOfAllFiles instanceof Map).toBeTruthy();
    expect(healthDataOfAllFiles.size).toEqual(17);
    expect(healthDataOfAllFiles.get("HCT Αιματοκρίτης")).toHaveLength(2);
    expect(healthDataOfAllFiles.get("HCT Αιματοκρίτης")).toEqual([
      {
        fileId: 0,
        healthTermValue: 49.1,
      },
      {
        fileId: 1,
        healthTermValue: 40.6,
      },
    ]);
    expect(healthDataOfAllFiles.get("MCHC Μέση πυκνότητα")).toHaveLength(1);
    expect(healthDataOfAllFiles.get("MCHC Μέση πυκνότητα")?.[0]).toEqual({
      fileId: 0,
      healthTermValue: 25.9,
    });
  });
});
