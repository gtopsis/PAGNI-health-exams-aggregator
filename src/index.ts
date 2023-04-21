import fs from "fs";
import pdfParser from "pdf-parse";
import { fileSearch } from "./fileSearcher";

const tokens = ["WBC", "Ne", "Ly", "Mo", "Eos", "Bas", "HCT", "HGB"];

interface FileResults {
  file: string;
  result: Record<string, string>[];
}

async function extractPDFText(
  dataBuffer: Buffer
): Promise<FileResults["result"]> {
  try {
    const { text } = await pdfParser(dataBuffer);

    return fileSearch(text, tokens);
  } catch (error) {
    console.log("error:", error);

    return [];
  }
}

async function managePDFs() {
  const pdfsFolder = "./pdfs";
  const files = fs.readdirSync(pdfsFolder);
  const results = [];

  for (const file of files) {
    const path = `${pdfsFolder}/${file}`;

    const dataBuffer = fs.readFileSync(path);

    const result = await extractPDFText(dataBuffer);
    results.push({ file: path, result });
  }

  return results;
}

(async () => {
  try {
    const results = await managePDFs();
    console.info("Results:", JSON.stringify(results, null, 4));
  } catch (e) {
    // Deal with the fact the chain failed
  }
  // `text` is not available here
})();
