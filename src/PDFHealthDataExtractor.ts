import fs from "fs";
import pdfParser from "pdf-parse";
import { HealthTermsType, healthTerms, searchText } from "./textSearcher";

interface FileDetails {
  fileId: number;
  filename: string;
  date: string;
}

interface HealthTermValueInFile {
  fileId: number;
  healthTermValue: number;
}
type FilesResults = Map<HealthTermsType, HealthTermValueInFile[]>;

export async function extractHealthDataFromPDF(filePath: string): Promise<{
  date: FileDetails["date"];
  result: Map<HealthTermsType, number>;
}> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const { text } = await pdfParser(dataBuffer);

    return searchText(text);
  } catch (error) {
    console.error("Error: ", error);

    return { date: "", result: new Map<HealthTermsType, number>() };
  }
}

export async function extractHealthDataFromPDFs() {
  const pdfsDir = "./pdfs";
  const filesData: FileDetails[] = [];
  const healthDataOfAllFiles: FilesResults = new Map(
    healthTerms.map((term) => [term, []])
  );

  const filenames = fs.readdirSync(pdfsDir);
  for (const filename of filenames) {
    const filePath = `${pdfsDir}/${filename}`;

    const { date, result: healthTermsFromFile } =
      await extractHealthDataFromPDF(filePath);

    const fileId = filesData.length;
    filesData.push({ fileId, filename, date });

    healthTermsFromFile.forEach((healthTermValue, healthTerm) => {
      const existingValuesOfHealthTerm =
        healthDataOfAllFiles.get(healthTerm) || [];

      existingValuesOfHealthTerm.push({ fileId, healthTermValue });

      healthDataOfAllFiles.set(healthTerm, existingValuesOfHealthTerm);
    });
  }

  return { filesData, healthDataOfAllFiles };
}
