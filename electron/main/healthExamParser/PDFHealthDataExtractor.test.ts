import pdfParser from "pdf-parse";
import { extractHealthDataFromPDF } from "./PDFHealthDataExtractor";

jest.mock("fs", () => {
  return {
    readFileSync: jest.fn(),
  };
});

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
