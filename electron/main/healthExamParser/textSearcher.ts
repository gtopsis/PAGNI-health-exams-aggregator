import dayjs from "dayjs";

export function getHealthExamDateFromText(text: string) {
  const dateRegex = /Ημ\/νία παραλαβής:[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}/;
  const regex = new RegExp(dateRegex, "g");

  const match = text.match(regex);
  const dateParts = match?.[0]
    .replace("Ημ/νία παραλαβής:", "")
    .trim()
    .split("/");
  const formattedDate = `${dateParts?.[1]}/${dateParts?.[0]}/${dateParts?.[2]}`;

  return dayjs(formattedDate).isValid() ? formattedDate : undefined;
}

export const getHealthTermsDataFromText = (
  text: string,
  queryTerms: string[]
): Map<string, number> => {
  const result: Map<string, number> = new Map();

  const regexForNumber = "\\d*(,\\d+)?";
  const unionOfMetrics = "(" + queryTerms.join("|") + ")";
  const valueRegex = regexForNumber;
  const healthTermCanonicalValuesRegex = `(${regexForNumber}-${regexForNumber})`;
  const healthTermMeasurementUnitRegex = "\\S*";

  const regex = new RegExp(
    `${valueRegex}${unionOfMetrics}\\D*${healthTermCanonicalValuesRegex}${healthTermMeasurementUnitRegex}`,
    "g"
  );
  const matches = text.match(regex);

  matches?.forEach((match) => {
    const healthTerm = match.match(new RegExp(unionOfMetrics, "g"))?.[0].trim();
    if (!healthTerm) {
      return;
    }
    let formatedMinValue: number | undefined,
      formatedMaxValue: number | undefined = undefined;
    let rest = match.replace(healthTerm, " ");
    const valueRange = rest.match(healthTermCanonicalValuesRegex)?.[0];
    if (valueRange) {
      const [minValue, maxValue] = valueRange.split("-");
      formatedMinValue = Number(minValue?.replace(",", "."));
      formatedMaxValue = Number(maxValue?.replace(",", "."));
      rest = rest.replace(valueRange || "", " ");
    }

    const unit = rest.match(healthTermMeasurementUnitRegex + "$")?.[0];
    const value = rest.match("^" + valueRegex)?.[0];

    if (!value) {
      return;
    }

    const formattedValue = Number(value.replace(",", "."));
    console.log(
      healthTerm,
      formattedValue,
      formatedMinValue,
      formatedMaxValue,
      unit
    );

    // safe typecast case regex match ensures
    result.set(healthTerm, formattedValue);
  });

  return result;
};
