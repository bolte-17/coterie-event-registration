export type Ok<T> = {ok: true; value: T};
export type Err<E> = {ok: false; error: E};
export type Result<T, E = Error> = Ok<T> | Err<E>;

export function isResult(x: unknown): x is Result<unknown, unknown> {
  return x !== null
    && typeof x === 'object'
    && 'ok' in x
    && typeof x.ok === 'boolean'
    && (x.ok ? 'value' in x : 'error' in x);
}

export function ok<T>(value: T): Ok<T> {
  return {ok: true, value};
}

export function err<T>(e: T): Err<T> {
  return {ok: false, error: e};
}

export function bind<T, U, E>(f: (x: T) => Result<U, E>) {
  return <E2>(previousResult: Result<T, E2>): Result<U, E | E2> => previousResult.ok ? f(previousResult.value) : previousResult;
}

export function bindAsync<T, U, E>(f: (x: T) => Promise<Result<U, E>>): <E2>(x: Result<T, E2> | Promise<Result<T, E2>>) => Promise<Result<U, E | E2>> {
  return async previous => {
    const r = await Promise.resolve(previous).catch(err);
    return r.ok ? f(r.value).catch(err) : r;
  };
}

export function map<T, U>(f: (x: T) => U) {
  return bind((x: T) => ok(f(x)) as Result<U, never>);
}

export function mapAsync<T, U>(f: (x: T) => Promise<U>) {
  return bindAsync(async (x: T) => f(x).then(ok));
}

export function handleError<T, E>(handler: (err: E) => T): (result: Result<T, E>) => T {
  return r => r.ok ? r.value : handler(r.error);
}

export function asyncly<T, U>(f: (x: T) => U) {
  return async (x: Promise<T>) => x.then(f);
}
