function replacer(key: string, value: any) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

function reviver(key: string, value: any) {
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      return new Map(value.value);
    }
  }
  return value;
}

export function stringifyDataWithComplexStructure(data: unknown) {
  return JSON.stringify(data, replacer);
}

export function parseStringifiedDataWithComplexStructure(data: string) {
  return JSON.stringify(data, reviver);
}
