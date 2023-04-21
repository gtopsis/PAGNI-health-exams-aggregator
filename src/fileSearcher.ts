export const fileSearch = (
  contents: string,
  tokens: string[] = []
): Record<string, string>[] => {
  const result: Record<string, string>[] = [];

  const lines = contents.toString().split("\n");
  lines.forEach((line) => {
    tokens.forEach((token) => {
      const regEx = new RegExp(token, "i");

      if (line && line.search(regEx) >= 0) {
        const [value] = line.split(regEx);

        result.push({ [token]: value });
      }
    });
  });

  return result;
};
