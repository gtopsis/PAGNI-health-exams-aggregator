import fs from "fs";
import pdfParser from "pdf-parse";
import {
  getHealthExamDateFromText,
  getHealthTermsDataFromText,
} from "./textSearcher";
import { FileDetails, FilesResults, Results } from "../../../common/interfaces";

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

export async function extractHealthDataFromPDFs(
  filesPaths: string[]
): Promise<Results> {
  const filesData: FileDetails[] = [];
  const healthDataOfAllFiles: FilesResults = new Map(
    healthTerms.map((term) => [term, []])
  );

  for (const filePath of filesPaths) {
    const { date, result: healthTermsFromFile } =
      await extractHealthDataFromPDF(filePath);

    const fileId = filesData.length;
    filesData.push({ fileId, filePath, date });

    healthTermsFromFile.forEach((healthTermValue, healthTerm) => {
      const existingValuesOfHealthTerm =
        healthDataOfAllFiles.get(healthTerm) || [];

      existingValuesOfHealthTerm.push({ fileId, healthTermValue });

      healthDataOfAllFiles.set(healthTerm, existingValuesOfHealthTerm);
    });
  }

  return { filesData, healthDataOfAllFiles };
}
