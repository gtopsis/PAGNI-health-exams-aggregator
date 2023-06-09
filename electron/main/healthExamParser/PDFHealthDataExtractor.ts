import fs from "fs";
import pdfParser from "pdf-parse";
import {
  getHealthExamDateFromText,
  getHealthTermsDataFromText,
} from "./textSearcher";
import {
  FileDetails,
  Results,
  UploadedFileMetadata,
} from "../../../common/interfaces";

export const healthTerms = [
  "WBC  Λευκά αιμοσφ.",
  "Ne Ουδετερόφιλα",
  "Ly Λεμφοκύτταρα",
  "Mo Μονοκύτταρα",
  "Eos Ηωσινόφιλα",
  "Bas Βασεόφιλα",
  "RBC Ερυθρά αιμοσφαίρια",
  "HGB Αιμοσφαιρίνη",
  "HCT Αιματοκρίτης",
  "MCV Μέσος όγκος",
  "MCH Μέση περ.Hb",
  "MCHC Μέση πυκνότητα",
  "RDW Εύρος καταν.ερυθρ.",
  "PLT Αιμοπετάλια",
  "MPV Μέσος όγκος αιμοπεταλίων",
  "PCT Αιμοπεταλιοκρίτης",
  "PDW Εύρος κατανομής",
];

export async function extractHealthDataFromPDF(filePath: string): Promise<{
  date: FileDetails["date"];
  result: Map<string, number>;
}> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const { text } = await pdfParser(dataBuffer);
    const date = getHealthExamDateFromText(text);
    const result = getHealthTermsDataFromText(text, healthTerms);

    return { date, result };
  } catch (error) {
    console.error("Error: ", error);

    return { date: undefined, result: new Map<string, number>() };
  }
}

export async function addHealthDataFromNewHealthExams(
  existingHealthData: Results,
  filesMetadata: UploadedFileMetadata[]
) {
  for (const { path: filePath, name: filename } of filesMetadata) {
    const { date, result: healthTermsFromFile } =
      await extractHealthDataFromPDF(filePath);

    const fileId = existingHealthData.filesDetails?.length || 0;
    existingHealthData.filesDetails.push({
      fileId,
      filePath,
      filename,
      date,
    });

    healthTermsFromFile.forEach((healthTermValue, healthTerm) => {
      const existingValuesOfHealthTerm =
        existingHealthData.healthTermsValues.get(healthTerm) || [];

      existingValuesOfHealthTerm.push({ fileId, healthTermValue });

      existingHealthData.healthTermsValues.set(
        healthTerm,
        existingValuesOfHealthTerm
      );
    });
  }

  return existingHealthData;
}
