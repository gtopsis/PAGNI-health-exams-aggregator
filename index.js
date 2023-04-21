import fs from "fs";
import PDFParser from "pdf2json";
import { eachSeries } from "async";
import { fileSearch } from "./fileSearcher.js";

const finds = [];

const processData = (pdfData) => {
  const tokens = ["HCT", "HGB"];

  return fileSearch(pdfData, tokens);
};

function readOneFile(path, cbError) {
  const pdfParser = new PDFParser(this, 1);
  pdfParser.on("pdfParser_dataError", (errData) => {
    cbError(errData);
  });
  pdfParser.on("pdfParser_dataReady", (pdfData) => {
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
  (err) => {
    if (err) {
      console.log(err);
    }
    console.info("Results:", finds);
  }
);
