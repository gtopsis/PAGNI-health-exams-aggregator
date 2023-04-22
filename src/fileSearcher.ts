const healthMetrics = [
  "WBC",
  "Ne",
  "Ly",
  "Mo",
  "Eos",
  "Bas",
  "HCT",
  "HGB",
] as const;

type TokensType = (typeof healthMetrics)[number];

export interface FileResults {
  file: string;
  result: Map<TokensType, string>;
}

export const fileSearch = (contents: string): FileResults["result"] => {
  const result: FileResults["result"] = new Map();

  const lines = contents.toString().split("\n");
  lines.forEach((line) => {
    healthMetrics.forEach((token) => {
      const regEx = new RegExp(token, "i");

      if (line && line.search(regEx) >= 0) {
        const [value] = line.split(regEx);

        result.set(token, value);
      }
    });
  });

  return result;
};
