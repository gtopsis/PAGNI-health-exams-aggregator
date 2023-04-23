import fs from "fs";
import pdfParser from "pdf-parse";
import { HealthTermsType, healthTerms, searchText } from "./textSearcher";

type HealthTermValueInFile = { file: string; healthTermValue: number };
type FilesResults = Map<HealthTermsType, HealthTermValueInFile[]>;

async function extractHealthTermsFromPDFText(
  filePath: string
): Promise<Map<HealthTermsType, number>> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const { text } = await pdfParser(dataBuffer);

    return searchText(text);
  } catch (error) {
    console.error("Error: ", error);

    return new Map();
  }
}

async function managePDFs() {
  const pdfsFolder = "./pdfs";
  const files = fs.readdirSync(pdfsFolder);
  const results: FilesResults = new Map(healthTerms.map((term) => [term, []]));

  for (const file of files) {
    const filePath = `${pdfsFolder}/${file}`;

    const healthTermsFromFile = await extractHealthTermsFromPDFText(filePath);

    healthTermsFromFile.forEach((value, key) =>
      results.set(key, [
        ...(results.get(key) || []),
        { file, healthTermValue: value },
      ])
    );
  }

  return results;
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
    const results = await managePDFs();
    console.info("Results:", JSON.stringify(objectPrintFormatter(results)));
  } catch (e) {
    // Deal with the fact the chain failed
  }
  // `text` is not available here
})();
