import pdfParser from "pdf-parse";
import {
  addHealthDataFromNewHealthExams,
  extractHealthDataFromPDF,
} from "./PDFHealthDataExtractor";
import { HealthTermValueInFile, Results } from "../../../common/interfaces";

jest.mock("fs", () => ({
  readFileSync: jest.fn(),
}));

jest.mock("pdf-parse");

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
  const files = [
    { path: "path/to/file1.pdf", name: "file1.pdf" },
    { path: "path/to/file2.pdf", name: "file2.pdf" },
  ];

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
    const totalHealthData: Results = {
      filesDetails: [],
      healthTermsValues: new Map<string, HealthTermValueInFile[]>(),
    };

    const { filesDetails, healthTermsValues } =
      await addHealthDataFromNewHealthExams(totalHealthData, files);

    expect(filesDetails).not.toEqual(undefined);
    expect(filesDetails).toEqual([
      {
        fileId: 0,
        filePath: "path/to/file1.pdf",
        filename: "file1.pdf",
        date: undefined,
      },
      {
        fileId: 1,
        filePath: "path/to/file2.pdf",
        filename: "file2.pdf",
        date: "04/05/2023",
      },
    ]);
    expect(healthTermsValues).not.toEqual(undefined);
    expect(healthTermsValues instanceof Map).toBeTruthy();
    expect(healthTermsValues.size).toEqual(1);
    expect(healthTermsValues.get("HCT Αιματοκρίτης")).toHaveLength(1);
    expect(healthTermsValues.get("HCT Αιματοκρίτης")?.[0]).toEqual({
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
    const totalHealthData: Results = {
      filesDetails: [],
      healthTermsValues: new Map<string, HealthTermValueInFile[]>(),
    };

    const { filesDetails, healthTermsValues } =
      await addHealthDataFromNewHealthExams(totalHealthData, files);

    expect(filesDetails).not.toEqual(undefined);
    expect(filesDetails).toEqual([
      {
        fileId: 0,
        filePath: "path/to/file1.pdf",
        filename: "file1.pdf",
        date: "05/11/2023",
      },
      {
        fileId: 1,
        filePath: "path/to/file2.pdf",
        filename: "file2.pdf",
        date: "04/05/2023",
      },
    ]);
    expect(healthTermsValues).not.toEqual(undefined);
    expect(healthTermsValues instanceof Map).toBeTruthy();
    expect(healthTermsValues.size).toEqual(2);
    expect(healthTermsValues.get("HCT Αιματοκρίτης")).toHaveLength(2);
    expect(healthTermsValues.get("HCT Αιματοκρίτης")).toEqual([
      {
        fileId: 0,
        healthTermValue: 49.1,
      },
      {
        fileId: 1,
        healthTermValue: 40.6,
      },
    ]);
    expect(
      totalHealthData.healthTermsValues.get("MCHC Μέση πυκνότητα")
    ).toHaveLength(1);
    expect(
      totalHealthData.healthTermsValues.get("MCHC Μέση πυκνότητα")?.[0]
    ).toEqual({
      fileId: 0,
      healthTermValue: 25.9,
    });
  });
});
