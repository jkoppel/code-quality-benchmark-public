/*******************************************
 ****** Result (aka Either) type ************
 ********************************************/

/** aka Either */
export type Result<T, E> = { type: "success"; value: T } | { type: "failure"; error: E };

export function makeSuccessResult<T>(value: T) {
  return { type: "success" as const, value };
}

export function makeFailure<E>(error: E) {
  return { type: "failure" as const, error };
}

export function isSuccessResult<T, E>(result: Result<T, E>) {
  return result.type === "success";
}

export function isFailureResult<T, E>(result: Result<T, E>) {
  return result.type === "failure";
}
