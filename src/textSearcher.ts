export const healthTerms = [
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

export type HealthTermsType = (typeof healthTerms)[number];

export const searchText = (text: string): Map<HealthTermsType, number> => {
  console.log("🚀 ~ file: textSearcher.ts:24 ~ searchText ~ text:", text);
  const result: Map<HealthTermsType, number> = new Map();

  const unionOfMetrics = healthTerms.join("|");
  const regex = new RegExp(`[0-9].*(${unionOfMetrics})`, "g");
  const matches = text.match(regex);

  matches?.forEach((match) => {
    // this regex based on the format of the above one
    const indexWhenHealthTermStarts = match.search(/[^(\d|,)]/);

    const healthTerm = match.substring(indexWhenHealthTermStarts).trim();
    const value = Number(
      match.substring(0, indexWhenHealthTermStarts).replace(",", ".")
    );

    // safe typecast case regex match ensures
    result.set(healthTerm as HealthTermsType, value);
  });

  return result;
};
