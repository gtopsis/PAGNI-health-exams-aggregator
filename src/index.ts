import fs from "fs";
import pdfParser from "pdf-parse";
import { FileResults, textSearch } from "./fileSearcher";

async function extractPDFText(
  dataBuffer: Buffer
): Promise<FileResults["result"]> {
  try {
    const { text } = await pdfParser(dataBuffer);

    return textSearch(text);
  } catch (error) {
    console.error("Error: ", error);

    return new Map();
  }
}

async function managePDFs() {
  const pdfsFolder = "./pdfs";
  const files = fs.readdirSync(pdfsFolder);
  const results: FileResults[] = [];

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
    console.info(
      "Results:",
      JSON.stringify(
        results.map((r) => ({
          file: r.file,
          result: objectPrintFormatter(r.result),
        })),
        null,
        4
      )
    );
  } catch (e) {
    // Deal with the fact the chain failed
  }
  // `text` is not available here
})();

const objectPrintFormatter = (toPrint: unknown) => {
  if (toPrint instanceof Set || toPrint instanceof Map) {
    return JSON.stringify(Array.from(toPrint));
  } else if (toPrint instanceof Object) {
    return JSON.stringify(toPrint);
  }
  return toPrint;
};
