export type Ok<T> = {ok: true; value: T};
export type Err<E> = {ok: false; error: E};
export type Result<T, E = Error> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return {ok: true, value};
}

export function err<T>(e: T): Err<T> {
  return {ok: false, error: e};
}

export function bind<T, U, E>(f: (x: T) => Result<U, E>) {
  return <E2>(previousResult: Result<T, E2>): Result<U, E | E2> => previousResult.ok ? f(previousResult.value) : previousResult;
}

export function map<T, U>(f: (x: T) => U) {
  return bind((x: T) => ok(f(x)) as Result<U, never>);
}

export function handleError<T, E>(handler: (err: E) => T): (result: Result<T, E>) => T {
  return r => r.ok ? r.value : handler(r.error);
}
