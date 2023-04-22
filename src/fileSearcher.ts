const healthMetrics = [
  "WBC",
  "Ne",
  "Ly",
  "Mo",
  "Eos",
  "Bas",
  "RBC",
  "HGB",
  "HCT",
  "MCV",
  "MCH",
  "MCHC",
  "RDW",
  "PLT",
  "MPV",
  "PCT",
  "PDW",
] as const;

type TokensType = (typeof healthMetrics)[number];

export interface FileResults {
  file: string;
  result: Map<TokensType, string>;
}

export const textSearch = (contents: string): FileResults["result"] => {
  const result: FileResults["result"] = new Map();

  const lines = contents.toString().split("\n");
  lines.forEach((line) => {
    healthMetrics.forEach((token) => {
      const regEx = new RegExp(".*[0-9].*" + token + " ", "i");

      if (line && line.search(regEx) >= 0) {
        console.log(line);
        const [value] = line.split(token);

        result.set(token, value);
      }
    });
  });

  return result;
};
