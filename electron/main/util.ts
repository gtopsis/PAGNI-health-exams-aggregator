const replacer = (key: string, value: any) => {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  }

  return value;
};

const reviver = (key: string, value: any) => {
  if (typeof value === "object" && value !== null && value.dataType === "Map") {
    return new Map(value.value);
  }

  return value;
};

export const stringifyDataWithComplexStructure = (data: unknown) =>
  JSON.stringify(data, replacer);

export const parseStringifiedDataWithComplexStructure = (data: string) =>
  JSON.parse(data, reviver);
