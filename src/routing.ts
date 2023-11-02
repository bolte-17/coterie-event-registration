import {type IncomingMessage, type ServerResponse} from 'http';

export enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
}

export type Conn = {
  // Req: IncomingMessage;
  // Res: ServerResponse;
  method: IncomingMessage['method'];
  path: string;
  body: unknown | Error;
  result?: {
    statusCode: HttpStatusCode;
    body?: any;
  };
  halted: boolean;
};
export type Plug = (c: Conn) => Conn;

export function conn(req: IncomingMessage, body: unknown | Error = {}, halted = false): Conn {
  return {
    path: new URL(req.url ?? '', `http://${req.headers?.host ?? 'example.com'}`).pathname,
    method: req.method,
    halted,
    body,
  };
}

export function whenNotHalted(f: Plug): Plug {
  return c => c.halted ? c : f(c);
}

type HttpMethod = 'GET' | 'POST';
function route(routeMethod: HttpMethod, routePath: string, plug: Plug): Plug {
  return whenNotHalted(conn => conn.method === routeMethod && conn.path === routePath ? plug(conn) : conn);
}

export function get(routePath: string, plug: Plug) {
  return route('GET', routePath, plug);
}

export function post(routePath: string, plug: Plug) {
  return route('POST', routePath, plug);
}

export function respond(statusCode: HttpStatusCode, body?: unknown, halted = true): Plug {
  return whenNotHalted(conn => ({...conn, result: {statusCode, body}, halted}));
}
