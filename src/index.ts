import fs from "fs";
import pdfParser from "pdf-parse";
import { HealthTermsType, healthTerms, searchText } from "./textSearcher";

type HealthTermValueInFile = { file: string; healthTermValue: number };
type FilesResults = Map<HealthTermsType, HealthTermValueInFile[]>;

async function extractHealthDataFromPDF(
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

async function extractHealthDataFromPDFs() {
  const pdfsDir = "./pdfs";
  const filenames = fs.readdirSync(pdfsDir);
  const healthDataOfAllFiles: FilesResults = new Map(
    healthTerms.map((term) => [term, []])
  );

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

const objectPrintFormatter = (toPrint: unknown) => {
  if (toPrint instanceof Set || toPrint instanceof Map) {
    return JSON.stringify(Array.from(toPrint));
  } else if (toPrint instanceof Object) {
    return JSON.stringify(toPrint);
  }
  return toPrint;
};

(async () => {
  try {
    const healthData = await extractHealthDataFromPDFs();
    console.info("Results:", JSON.stringify(objectPrintFormatter(healthData)));
  } catch (error) {
    console.error(error);
  }
})();
