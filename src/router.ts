import {pipe, pipeWith} from 'pipe-ts';
import {get, post, respond, HttpStatusCode, type Conn, composePlugs} from './routing';
import {createEventRegistration} from './eventRegistration/eventRegistration';
import {map, ok, handleError, err, bind} from './result';

async function saveRegistration(conn: Conn) {
  const {body} = conn;
  const registration
    = body instanceof Error || body === undefined || body === null
      ? err(body ?? new Error('Expected a body payload representing registration to create'))
      : ok(body);

  return pipeWith(registration,
    bind(createEventRegistration),
    map(r => respond(HttpStatusCode.OK, r)),
    handleError(e => respond(HttpStatusCode.BAD_REQUEST, e.message)),
  )(conn);
}

export const routes = [
  get('/ping', respond(HttpStatusCode.OK, 'pong')),
  post('/create', saveRegistration),
  respond(HttpStatusCode.NOT_FOUND),
];

export const router = composePlugs(...routes);
