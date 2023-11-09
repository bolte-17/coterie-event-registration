import {isResult} from '../result';
import {type Conn} from './conn';

export enum HttpStatusCode {
  OK = 200,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_AUTHORIZED = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export type Plug = (c: Conn) => Conn | Promise<Conn>;

export function whenNotHalted(f: Plug): Plug {
  return async c => c.halted ? c : f(c);
}

type HttpMethod = 'GET' | 'POST';
function route(routeMethod: HttpMethod, routePath: string, plug: Plug): Plug {
  return whenNotHalted(async conn => conn.method === routeMethod && conn.path === routePath ? plug(conn) : conn);
}

export function get(routePath: string, plug: Plug) {
  return route('GET', routePath, plug);
}

export function post(routePath: string, plug: Plug, opts = {checkBody: true}) {
  return route('POST', routePath, async c => {
    if (opts.checkBody && c.body instanceof Error) {
      return respond(c.body, 400)(c);
    }

    return plug(c);
  });
}

export function respond(body: unknown, statusCode: HttpStatusCode = HttpStatusCode.OK, halted = true): Plug {
  return whenNotHalted(conn => {
    let result = {statusCode, body};
    if (isResult(body)) {
      result = body.ok ? {statusCode, body: body.value} : {statusCode: 500, body: body.error};
    }

    if (result.body instanceof Error) {
      result = {
        statusCode: errorStatusCode(result.body),
        body: result.body.message,
      };
    }

    return {...conn, result, halted};
  });
}

function errorStatusCode(e: Error) {
  return hasStatusCode(e) ? e.statusCode : 500;

  function hasStatusCode(obj: unknown): obj is {statusCode: number} {
    const statusCode = (obj as {statusCode: number})?.statusCode;
    return statusCode !== undefined && typeof statusCode === 'number';
  }
}

export function composePlugs(...plugs: Plug[]): Plug {
  return plugs.reduce((f, g) => async x => g(await f(x)), x => x);
}
