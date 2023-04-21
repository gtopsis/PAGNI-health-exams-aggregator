import fs from "fs";
import pdfParser from "pdf-parse";
import { fileSearch } from "./fileSearcher";

const tokens = ["HCT", "HGB"];

interface FileResults {
  file: string;
  result: Record<string, string>[];
}

const finds: FileResults[] = [];

async function extractPDFText(dataBuffer: Buffer) {
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

  for (const file of files) {
    const path = `${pdfsFolder}/${file}`;

    const dataBuffer = fs.readFileSync(path);

    const result = await extractPDFText(dataBuffer);
    finds.push({ file: path, result });
  }
  console.info("Results:", finds);
}

(async () => {
  try {
    await managePDFs();
  } catch (e) {
    // Deal with the fact the chain failed
  }
  // `text` is not available here
})();
