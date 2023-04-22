const healthMetrics = [
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

type TokensType = (typeof healthMetrics)[number];

export interface FileResults {
  file: string;
  result: Map<TokensType, string>;
}

export const searchText = (contents: string): FileResults["result"] => {
  const result: FileResults["result"] = new Map();

  const lines = contents.toString().split("\n");
  lines.forEach((line) => {
    healthMetrics.forEach((token) => {
      const regEx = new RegExp("[0-9].*" + token, "i");

      if (line && line.search(regEx) >= 0) {
        console.log(line);
        const [value] = line.split(token);

        result.set(token, value.trim());
      }
    });
  });

  return result;
};
