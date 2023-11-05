import pdfParser from "pdf-parse";
import {
  addHealthDataFromNewMedicalReports,
  extractHealthDataFromPDF,
} from "./PDFHealthDataExtractor";
import { MedicalTestResultFromFile, Results } from "../../../common/interfaces";

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

  it("will return no data when the file content has no medical tests", async () => {
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

  it("will return last occurence of HCT when the file content has multiple occurences of the medical test HCT", async () => {
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
      resultsForAllMedicalTestsFromAllFiles: new Map<
        string,
        MedicalTestResultFromFile[]
      >(),
    };

    const { filesDetails, resultsForAllMedicalTestsFromAllFiles } =
      await addHealthDataFromNewMedicalReports(totalHealthData, files);

    expect(filesDetails).not.toEqual(undefined);
    expect(filesDetails).toEqual([
      {
        id: 0,
        path: "path/to/file1.pdf",
        name: "file1.pdf",
        date: undefined,
      },
      {
        id: 1,
        path: "path/to/file2.pdf",
        name: "file2.pdf",
        date: "04/05/2023",
      },
    ]);
    expect(resultsForAllMedicalTestsFromAllFiles).not.toEqual(undefined);
    expect(resultsForAllMedicalTestsFromAllFiles instanceof Map).toBeTruthy();
    expect(resultsForAllMedicalTestsFromAllFiles.size).toEqual(1);
    expect(
      resultsForAllMedicalTestsFromAllFiles.get("HCT Αιματοκρίτης")
    ).toHaveLength(1);
    expect(
      resultsForAllMedicalTestsFromAllFiles.get("HCT Αιματοκρίτης")?.[0]
    ).toEqual({
      fileId: 1,
      medicalTestResult: 40.6,
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
      resultsForAllMedicalTestsFromAllFiles: new Map<
        string,
        MedicalTestResultFromFile[]
      >(),
    };

    const { filesDetails, resultsForAllMedicalTestsFromAllFiles } =
      await addHealthDataFromNewMedicalReports(totalHealthData, files);

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
    expect(resultsForAllMedicalTestsFromAllFiles).not.toEqual(undefined);
    expect(resultsForAllMedicalTestsFromAllFiles instanceof Map).toBeTruthy();
    expect(resultsForAllMedicalTestsFromAllFiles.size).toEqual(2);
    expect(
      resultsForAllMedicalTestsFromAllFiles.get("HCT Αιματοκρίτης")
    ).toHaveLength(2);
    expect(
      resultsForAllMedicalTestsFromAllFiles.get("HCT Αιματοκρίτης")
    ).toEqual([
      {
        fileId: 0,
        medicalTestResult: 49.1,
      },
      {
        fileId: 1,
        medicalTestResult: 40.6,
      },
    ]);
    expect(
      totalHealthData.resultsForAllMedicalTestsFromAllFiles.get(
        "MCHC Μέση πυκνότητα"
      )
    ).toHaveLength(1);
    expect(
      totalHealthData.resultsForAllMedicalTestsFromAllFiles.get(
        "MCHC Μέση πυκνότητα"
      )?.[0]
    ).toEqual({
      fileId: 0,
      medicalTestResult: 25.9,
    });
  });
});
