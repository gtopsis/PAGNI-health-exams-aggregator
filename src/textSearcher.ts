import dayjs from "dayjs";

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

function getHealthExamDateFromText(text: string) {
  const dateRegex = /Ημ\/νία παραλαβής:[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}/;
  const regex = new RegExp(dateRegex, "g");

  const match = text.match(regex);
  const date = match?.[0].replace("Ημ/νία παραλαβής:", "");

  return dayjs(date).isValid() ? date : undefined;
}

export const searchText = (
  text: string
): { date: string; result: Map<HealthTermsType, number> } => {
  const result: Map<HealthTermsType, number> = new Map();

  const date = getHealthExamDateFromText(text);

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

  return { date: date || "", result };
};
