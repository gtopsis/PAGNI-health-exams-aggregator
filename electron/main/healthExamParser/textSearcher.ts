import dayjs from "dayjs";

export function getHealthExamDateFromText(text: string) {
  const dateRegex = /Ημ\/νία παραλαβής:[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}/;
  const regex = new RegExp(dateRegex, "g");

  const match = text.match(regex);
  const date = match?.[0].replace("Ημ/νία παραλαβής:", "");

  return dayjs(date).isValid() ? date : undefined;
}

export const getHealthTermsDataFromText = (
  text: string,
  queryTerms: string[]
): Map<string, number> => {
  const result: Map<string, number> = new Map();

  const unionOfMetrics = queryTerms.join("|");
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
    result.set(healthTerm, value);
  });

  return result;
};
