import {type IncomingMessage} from 'http';
import {type HttpStatusCode} from './routing';

export type Conn = {
  method: IncomingMessage['method'];
  path: string;
  searchParams?: URLSearchParams;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown | Error;
  result?: {
    statusCode: HttpStatusCode;
    body?: any;
  };
  halted: boolean;
};

export function conn(req: IncomingMessage, body: unknown | Error = {}, halted = false): Conn {
  const {pathname: path, searchParams} = new URL(req.url ?? '', `http://${req.headers?.host ?? 'example.com'}`);
  return {
    path,
    searchParams,
    headers: req.headers,
    method: req.method,
    halted,
    body,
  };
}

