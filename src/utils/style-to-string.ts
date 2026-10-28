export function styleToString(obj: Record<string, unknown>): string {
  let result = "";
  let separator = "";
  for (const key in obj) {
    const value = obj[key];
    // Like in React, empty values are skipped, so `color: ""` doesn't render `color: `.
    if (value === null || value === undefined || value === false || value === "") {
      continue;
    }
    result += `${separator}${key}: ${value}`;
    separator = "; ";
  }
  return result;
}
