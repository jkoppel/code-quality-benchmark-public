/** Use this only for humans -- it's not compact */
export function jsonStringify(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}
