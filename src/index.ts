import { extractHealthDataFromPDFs } from "./PDFHealthDataExtractor";

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
