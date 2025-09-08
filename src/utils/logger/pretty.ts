/** Use this only for humans -- it's not compact */
export function jsonStringify(obj: any): string {
  return JSON.stringify(obj, null, 2);
}
