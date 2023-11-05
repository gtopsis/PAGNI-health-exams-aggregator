import { medicalTests } from "./PDFHealthDataExtractor";
import {
  getMedicalReportDateFromText,
  getHealthTermsDataFromText,
} from "./textSearcher";

describe("Search date of exam in text", () => {
  it("will not return a date when the text is empty", () => {
    const date = getMedicalReportDateFromText("");

    expect(date).toEqual(undefined);
  });

  it("will not return info of the medical report's date when the text contains invalid date", () => {
    const date = getMedicalReportDateFromText(
      `
      Ημ/νία παραλαβής:05/04/
      40,6HCT Αιματοκρίτης 40-52%
    `
    );

    expect(date).toEqual(undefined);
  });
});

describe("Search health data inside text", () => {
  it("will return no finding when the text is empty", () => {
    const result = getHealthTermsDataFromText("", medicalTests);

    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(0);
  });

  it("will not return info for the medical test HCT when the text contains an incomplete data for this term", () => {
    const result = getHealthTermsDataFromText(
      `
      Ημ/νία παραλαβής:05/04/2023
      12,9AAA Αιμοσφαιρίνη  14-18g/dl
      40,6HCT ΑιματοΧΧΧΧ 52%
      25,1MCHC Μέση πυκνότητα
    `,
      medicalTests
    );

    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(1);
    expect(result.get("HCT Αιματοκρίτης")).toEqual(undefined);
  });

  it("will return info for the medical test HCT when the text contains both valid term and value for the HCT", () => {
    const result = getHealthTermsDataFromText(
      `
      Ημ/νία παραλαβής:05/04/2023
      12,9AAA Αιμοσφαιρίνη  14-18g/dl
      40,6HCT Αιματοκρίτης 40-52%
      78,7BBB Μέσος όγκος
      25,1CCC Μέση περ.Hb
`,
      medicalTests
    );

    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(1);
    expect(result.get("HCT Αιματοκρίτης")).toEqual(40.6);
  });

  it("will return info for multiple medical tests and ignore non desired details", () => {
    const result = getHealthTermsDataFromText(
      `
      Ημ/νία παραλαβής:05/04/2023
      12,9AAA Αιμοσφαιρίνη  14-18g/dl
      40,6HCT Αιματοκρίτης 40-52%
      78,7BBB Μέσος όγκος
      25,1MCHC Μέση πυκνότητα
`,
      medicalTests
    );

    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(2);
    expect(result.get("HCT Αιματοκρίτης")).toEqual(40.6);
    expect(result.get("MCHC Μέση πυκνότητα")).toEqual(25.1);
  });
});
