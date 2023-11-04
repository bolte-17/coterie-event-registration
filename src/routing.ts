import {type IncomingMessage} from 'http';
import {ArgumentError, ValidationError} from './errors';
import {isResult} from './result';

export enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export type Conn = {
  method: IncomingMessage['method'];
  path: string;
  searchParams: URLSearchParams;
  body: unknown | Error;
  result?: {
    statusCode: HttpStatusCode;
    body?: any;
  };
  halted: boolean;
};
export type Plug = (c: Conn) => Conn | Promise<Conn>;

export function conn(req: IncomingMessage, body: unknown | Error = {}, halted = false): Conn {
  const {pathname: path, searchParams} = new URL(req.url ?? '', `http://${req.headers?.host ?? 'example.com'}`);
  return {
    path,
    searchParams,
    method: req.method,
    halted,
    body,
  };
}

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

export function post(routePath: string, plug: Plug) {
  return route('POST', routePath, plug);
}

export function respond(body: unknown, statusCode: HttpStatusCode = HttpStatusCode.OK, halted = true): Plug {
  return whenNotHalted(conn => {
    let result = {statusCode, body};
    if (isResult(body)) {
      result = body.ok ? {statusCode, body: body.value} : {statusCode: 500, body: body.error};
    }

    if (result.body instanceof Error) {
      result = {
        statusCode: result.body instanceof ValidationError || result.body instanceof ArgumentError ? 400 : 500,
        body: result.body.message,
      };
    }

    return {...conn, result, halted};
  });
}

export function composePlugs(...plugs: Plug[]): Plug {
  return plugs.reduce((f, g) => async x => g(await f(x)));
}
