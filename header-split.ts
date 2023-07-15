export function headerSplit(field: string): [string, string] {
  const parts = field.split(":").map((s) => s.trim());
  let header = "";
  let value = "";
  if (parts[0].length === 0) {
    header = `:${parts[1]}`;
    value = parts.slice(2).join(":");
  } else {
    header = parts[0];
    value = parts.slice(1).join(":");
  }

  return [header, value];
}
