export function hexDumpToArray(hexdump: string): number[] {
  return (
    hexdump
      .replaceAll(/\s/g, "")
      .match(/.{2}/g)
      ?.map((byte) => parseInt(byte, 16)) ?? []
  );
}
