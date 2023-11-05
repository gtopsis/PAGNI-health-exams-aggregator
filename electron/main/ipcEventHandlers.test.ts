import { MedicalTestResultFromFile, Results } from "../../common/interfaces";
import { parseNewHealthExam } from "./ipcEventsHandlers";

describe("Parse new medical report", () => {
  it("will try to process a new medical report when this one has already been processed", async () => {
    const newFileMetadata = {
      path: "dir/myfilename.pdf",
      name: "myfilename.pdf",
    };
    const existingTotalHealthData: Results = {
      filesDetails: [
        {
          id: 1,
          path: "dir/myfilename.pdf",
          name: "myfilename.pdf",
        },
      ],
      resultsForAllMedicalTestsFromAllFiles: new Map<
        string,
        MedicalTestResultFromFile[]
      >(),
    };
    existingTotalHealthData.resultsForAllMedicalTestsFromAllFiles.set("term", [
      { fileId: 1, medicalTestResult: 0.1 },
    ]);

    const newTotalHealthData = await parseNewHealthExam(
      existingTotalHealthData,
      [newFileMetadata]
    );

    expect(newTotalHealthData.filesDetails).toHaveLength(1);
    expect(newTotalHealthData.filesDetails[0]).toEqual({
      filePath: "dir/myfilename.pdf",
      fileId: 1,
      filename: "myfilename.pdf",
    });
    expect(
      Array.from(
        newTotalHealthData.resultsForAllMedicalTestsFromAllFiles.keys()
      )
    ).toEqual(["term"]);
    expect(
      newTotalHealthData.resultsForAllMedicalTestsFromAllFiles.get("term")
    ).toEqual([{ fileId: 1, medicalTestResult: 0.1 }]);
  });
});
