import { searchText } from "./textSearcher";

describe("Search text", () => {
  it("will return no finding when the text is empty", () => {
    const { date, result } = searchText("");

    expect(date).toEqual("");
    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(0);
  });

  it("will not return info for HCT when the text contains an incomplete version of health term for HCT", () => {
    const { date, result } = searchText(`
      Ημ/νία παραλαβής:05/04/2023
      12,9AAA Αιμοσφαιρίνη  14-18g/dl
      40,6HCT ΑιματοΧΧΧΧ 52%
      25,1MCHC Μέση πυκνότητα
    `);

    expect(date).toEqual("05/04/2023");
    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(1);
    expect(result.get("HCT Αιματοκρίτης")).toEqual(undefined);
  });

  it("will return info for HCT when the text contains both valid term and value for the HCT", () => {
    const { date, result } = searchText(`
      Ημ/νία παραλαβής:05/04/2023
      12,9AAA Αιμοσφαιρίνη  14-18g/dl
      40,6HCT Αιματοκρίτης 40-52%
      78,7BBB Μέσος όγκος
      25,1CCC Μέση περ.Hb
`);

    expect(date).toEqual("05/04/2023");
    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(1);
    expect(result.get("HCT Αιματοκρίτης")).toEqual(40.6);
  });

  it("will return info for multiple health terms and ignore non desired details", () => {
    const { date, result } = searchText(`
      Ημ/νία παραλαβής:05/04/2023
      12,9AAA Αιμοσφαιρίνη  14-18g/dl
      40,6HCT Αιματοκρίτης 40-52%
      78,7BBB Μέσος όγκος
      25,1MCHC Μέση πυκνότητα
`);

    expect(date).toEqual("05/04/2023");
    expect(result instanceof Map).toBeTruthy();
    expect(result.size).toEqual(2);
    expect(result.get("HCT Αιματοκρίτης")).toEqual(40.6);
    expect(result.get("MCHC Μέση πυκνότητα")).toEqual(25.1);
  });
});
