import fs from "fs";
import PDFParser from "pdf2json";
import { eachSeries } from "async";
import { fileSearch } from "./fileSearcher";

interface FileResults {
  file: string;
  result: Record<string, string>[];
}

const finds: FileResults[] = [];

const processData = (pdfData: string) => {
  const tokens = ["HCT", "HGB"];

  return fileSearch(pdfData, tokens);
};

function readOneFile(path: string, cbError: (s: string | null) => void) {
  const pdfParser = new PDFParser();

  pdfParser.on("pdfParser_dataError", (errData: string) => {
    cbError(errData);
  });
  pdfParser.on("pdfParser_dataReady", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = processData(pdfParser.getRawTextContent());
    finds.push({ file: path, result });
    cbError(null);
  });

  pdfParser.loadPDF(path);
}

const pdfsFolder = "./pdfs";
const files = fs.readdirSync(pdfsFolder);

eachSeries(
  files.map((f) => `${pdfsFolder}/${f}`),
  readOneFile,
  (err: unknown) => {
    if (err) {
      console.log(err);
    }
    console.info("Results:", finds);
  }
);
