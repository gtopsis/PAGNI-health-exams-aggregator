const healthTerms = [
  "WBC  Λευκά αιμοσφ.",
  "Ne Ουδετερόφιλα",
  "Ly Λεμφοκύτταρα",
  "Mo Μονοκύτταρα",
  "Eos Ηωσινόφιλα",
  "Bas Βασεόφιλα",
  "RBC Ερυθρά αιμοσφαίρια",
  "HGB Αιμοσφαιρίνη",
  "HCT Αιματοκρίτης",
  "MCV Μέσος όγκος",
  "MCH Μέση περ.Hb",
  "MCHC Μέση πυκνότητα",
  "RDW Εύρος καταν.ερυθρ.",
  "PLT Αιμοπετάλια",
  "MPV Μέσος όγκος αιμοπεταλίων",
  "PCT Αιμοπεταλιοκρίτης",
  "PDW Εύρος κατανομής",
] as const;

type TokensType = (typeof healthTerms)[number];

export interface FileResults {
  file: string;
  result: Map<TokensType, number>;
}

export const searchText = (contents: string): FileResults["result"] => {
  const result: FileResults["result"] = new Map();

  const unionOfMetrics = healthTerms.join("|");
  const regex = new RegExp(`[0-9].*(${unionOfMetrics})`, "g");
  const matches = contents.match(regex);

  matches?.forEach((match) => {
    // this regex based on the format of the above one
    const indexWhenHealthTermStarts = match.search(/[^(\d|,)]/);

    const healthTerm = match.substring(indexWhenHealthTermStarts).trim();
    const value = match
      .substring(0, indexWhenHealthTermStarts)
      .replace(",", ".");

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    result.set(healthTerm, Number(value));
  });

  // const lines = contents.split("\n");
  // console.debug(lines)

  return result;
};
