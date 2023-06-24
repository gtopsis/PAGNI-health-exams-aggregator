import { HealthTermValueInFile, Results } from "../../common/interfaces";
import { parseNewHealthExam } from "./ipcEventsHandlers";

describe("Parse new health exam", () => {
  it("will try to process an new health exam when this health exam has already been processed", async () => {
    const newFileMetadata = {
      path: "dir/myfilename.pdf",
      name: "myfilename.pdf",
    };
    const existingTotalHealthData: Results = {
      filesDetails: [
        {
          filePath: "dir/myfilename.pdf",
          fileId: 1,
          filename: "myfilename.pdf",
        },
      ],
      healthTermsValues: new Map<string, HealthTermValueInFile[]>(),
    };
    existingTotalHealthData.healthTermsValues.set("term", [
      { fileId: 1, healthTermValue: 0.1 },
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
    expect(Array.from(newTotalHealthData.healthTermsValues.keys())).toEqual([
      "term",
    ]);
    expect(newTotalHealthData.healthTermsValues.get("term")).toEqual([
      { fileId: 1, healthTermValue: 0.1 },
    ]);
  });
});
