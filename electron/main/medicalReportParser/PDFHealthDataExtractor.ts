import fs from "fs";
import pdfParser from "pdf-parse";
import {
  getMedicalReportDateFromText,
  getMedicaTestsResultsFromText,
} from "./textSearcher";
import {
  FileDetails,
  Results,
  UploadedFileMetadata,
} from "../../../common/interfaces";

export const medicalTests = [
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
    const date = getMedicalReportDateFromText(text);
    const result = getMedicaTestsResultsFromText(text, medicalTests);

    return { date, result };
  } catch (error) {
    console.error("Error: ", error);

    return { date: undefined, result: new Map<string, number>() };
  }
}

export async function addHealthDataFromNewMedicalReports(
  existingHealthData: Results,
  filesMetadata: UploadedFileMetadata[]
) {
  for (const { path: filePath, name: filename } of filesMetadata) {
    const { date, result: healthTermsFromFile } =
      await extractHealthDataFromPDF(filePath);

    const fileId = existingHealthData.filesDetails?.length || 0;
    existingHealthData.filesDetails.push({
      id: fileId,
      path: filePath,
      name: filename,
      date,
    });

    healthTermsFromFile.forEach((medicalTestResult, medicalTest) => {
      const existingValuesOfHealthTerm =
        existingHealthData.resultsForAllMedicalTestsFromAllFiles.get(
          medicalTest
        ) || [];

      existingValuesOfHealthTerm.push({ fileId, medicalTestResult });

      existingHealthData.resultsForAllMedicalTestsFromAllFiles.set(
        medicalTest,
        existingValuesOfHealthTerm
      );
    });
  }

  return existingHealthData;
}
