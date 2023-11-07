import type {
  MedicalTestResultFromMedicalReport,
  Results,
} from "../../common/interfaces";
import { parseNewMedicalReport } from "./ipcEventsHandlers";

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
        MedicalTestResultFromMedicalReport[]
      >(),
    };
    existingTotalHealthData.resultsForAllMedicalTestsFromAllFiles.set("term", [
      { medicalReportId: 1, medicalTestResult: 0.1 },
    ]);

    const newTotalHealthData = await parseNewMedicalReport(
      existingTotalHealthData,
      [newFileMetadata]
    );

    expect(newTotalHealthData.filesDetails).toHaveLength(1);
    expect(newTotalHealthData.filesDetails[0]).toEqual({
      path: "dir/myfilename.pdf",
      id: 1,
      name: "myfilename.pdf",
    });
    expect(
      Array.from(
        newTotalHealthData.resultsForAllMedicalTestsFromAllFiles.keys()
      )
    ).toEqual(["term"]);
    expect(
      newTotalHealthData.resultsForAllMedicalTestsFromAllFiles.get("term")
    ).toEqual([{ medicalReportId: 1, medicalTestResult: 0.1 }]);
  });
});
