import { searchText } from "./fileSearcher";

describe("Search text", () => {
  it("will return no finding when text is empty", () => {
    const result = searchText("");

    expect(result).not.toEqual(undefined);
    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(0);
  });

  it("will return info for HCT when text contains both the keyword HCT and its value", () => {
    const result = searchText(`
    12,9AAA Αιμοσφαιρίνη  14-18g/dl
    40,6HCT Αιματοκρίτης 40-52%
    78,7BBB Μέσος όγκος
    25,1CCC Μέση περ.Hb
`);

    expect(result).not.toEqual(undefined);
    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(1);
    expect(result.get("HCT Αιματοκρίτης")).toEqual("40,6");
  });
});
