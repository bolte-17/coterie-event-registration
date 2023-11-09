import {env} from 'process';
import {respond, type Conn, type Plug, composePlugs} from './routing';
import {sign, verify} from 'jsonwebtoken';

const opts = {
  issuer: 'eventregistration',
  audience: 'eventregistration',
};

export function generateToken() {
  return sign({data: 'authorized!'}, env.JWT_SECRET_KEY!, {
    ...opts,
    subject: crypto.randomUUID(),
  });
}

export function ensureAuth(routePrefix: string, ...children: Plug[]): Plug {
  return async conn => {
    if (!conn.path.startsWith(routePrefix)) {
      return conn;
    }

    const authHeader = conn.headers?.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = verify(authHeader.substring(7), env.JWT_SECRET_KEY!, opts);
      if (typeof token === 'object' && token?.sub?.match(/[a-z0-9-]/)) {
        const resultConn = await composePlugs(...children)({...conn, path: conn.path.substring(routePrefix.length)});
        return {...resultConn, path: conn.path};
      }
    }

    return respond(new NotAuthorizedError('Not Authorized'))(conn);
  };
}

export class NotAuthorizedError extends Error {
  statusCode = 403;
}
