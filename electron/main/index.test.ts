import pdfParser from "pdf-parse";
import { addHealthDataFromNewHealthExams } from ".";
import { HealthTermValueInFile, Results } from "../../common/interfaces";

const files = ["path/to/file1.pdf", "path/to/file2.pdf"];

describe("Extract health data of multiple files", () => {
  it("will return a single value fro HCT when only one of the file contains valid data for HCT", async () => {
    (pdfParser as jest.Mock).mockResolvedValueOnce({
      text: "",
    });
    (pdfParser as jest.Mock).mockResolvedValueOnce({
      text: `
        Ημ/νία παραλαβής:05/04/2023
        12,9AAA Αιμοσφαιρίνη  14-18g/dl
        40,6HCT Αιματοκρίτης 40-52%
    `,
    });
    let totalHealthData: Results = {
      filesData: [],
      healthDataOfAllFiles: new Map<string, HealthTermValueInFile[]>(),
    };

    const { filesData, healthDataOfAllFiles } = (totalHealthData =
      await addHealthDataFromNewHealthExams(totalHealthData, files));

    expect(filesData).not.toEqual(undefined);
    expect(filesData).toEqual([
      { fileId: 0, filePath: "path/to/file1.pdf", date: undefined },
      { fileId: 1, filePath: "path/to/file2.pdf", date: "04/05/2023" },
    ]);
    expect(healthDataOfAllFiles).not.toEqual(undefined);
    expect(healthDataOfAllFiles instanceof Map).toBeTruthy();
    expect(healthDataOfAllFiles.size).toEqual(17);
    expect(healthDataOfAllFiles.get("HCT Αιματοκρίτης")).toHaveLength(1);
    expect(healthDataOfAllFiles.get("HCT Αιματοκρίτης")?.[0]).toEqual({
      fileId: 1,
      healthTermValue: 40.6,
    });
  });

  it("will return a two values for HCT and one for MCHC when two files contain valid data for HCT and MCHC", async () => {
    (pdfParser as jest.Mock).mockResolvedValueOnce({
      text: `
      Ημ/νία παραλαβής:11/05/2023
      12,9AAA Αιμοσφαιρίνη  14-18g/dl
      49,1HCT Αιματοκρίτης 52%
      25,9MCHC Μέση πυκνότητα
    `,
    });
    (pdfParser as jest.Mock).mockResolvedValueOnce({
      text: `
        Ημ/νία παραλαβής:05/04/2023
        12,9AAA Αιμοσφαιρίνη  14-18g/dl
        40,6HCT Αιματοκρίτης 40-52%
    `,
    });
    let totalHealthData: Results = {
      filesData: [],
      healthDataOfAllFiles: new Map<string, HealthTermValueInFile[]>(),
    };

    totalHealthData = await addHealthDataFromNewHealthExams(
      totalHealthData,
      files
    );

    expect(totalHealthData.filesData).not.toEqual(undefined);
    expect(totalHealthData.filesData).toEqual([
      { fileId: 0, filePath: "path/to/file1.pdf", date: "05/11/2023" },
      { fileId: 1, filePath: "path/to/file2.pdf", date: "04/05/2023" },
    ]);
    expect(totalHealthData.healthDataOfAllFiles).not.toEqual(undefined);
    expect(totalHealthData.healthDataOfAllFiles instanceof Map).toBeTruthy();
    expect(totalHealthData.healthDataOfAllFiles.size).toEqual(17);
    expect(
      totalHealthData.healthDataOfAllFiles.get("HCT Αιματοκρίτης")
    ).toHaveLength(2);
    expect(
      totalHealthData.healthDataOfAllFiles.get("HCT Αιματοκρίτης")
    ).toEqual([
      {
        fileId: 0,
        healthTermValue: 49.1,
      },
      {
        fileId: 1,
        healthTermValue: 40.6,
      },
    ]);
    expect(
      totalHealthData.healthDataOfAllFiles.get("MCHC Μέση πυκνότητα")
    ).toHaveLength(1);
    expect(
      totalHealthData.healthDataOfAllFiles.get("MCHC Μέση πυκνότητα")?.[0]
    ).toEqual({
      fileId: 0,
      healthTermValue: 25.9,
    });
  });
});
