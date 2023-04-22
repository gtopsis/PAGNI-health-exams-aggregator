import { searchText } from "./fileSearcher";

describe("Search text", () => {
  it("will return no finding when text is empty", () => {
    const result = searchText("");

    expect(result).not.toEqual(undefined);
    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(0);
  });
});
