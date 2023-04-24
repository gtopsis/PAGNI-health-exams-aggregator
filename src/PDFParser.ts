import fs from "fs";
import pdfParser from "pdf-parse";
import { HealthTermsType, healthTerms, searchText } from "./textSearcher";

type HealthTermValueInFile = { file: string; healthTermValue: number };
type FilesResults = Map<HealthTermsType, HealthTermValueInFile[]>;

export async function extractHealthDataFromPDF(
  filePath: string
): Promise<Map<HealthTermsType, number>> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const { text } = await pdfParser(dataBuffer);

    return searchText(text);
  } catch (error) {
    console.error("Error: ", error);

    return new Map<HealthTermsType, number>();
  }
}

export async function extractHealthDataFromPDFs() {
  const pdfsDir = "./pdfs";
  const healthDataOfAllFiles: FilesResults = new Map(
    healthTerms.map((term) => [term, []])
  );

  const filenames = fs.readdirSync(pdfsDir);
  for (const filename of filenames) {
    const filePath = `${pdfsDir}/${filename}`;

    const healthTermsFromFile = await extractHealthDataFromPDF(filePath);

    healthTermsFromFile.forEach((value, healthTerm) => {
      const existingValuesOfHealthTerm =
        healthDataOfAllFiles.get(healthTerm) || [];

      existingValuesOfHealthTerm.push({
        file: filename,
        healthTermValue: value,
      });

      healthDataOfAllFiles.set(healthTerm, existingValuesOfHealthTerm);
    });
  }

  return healthDataOfAllFiles;
}
