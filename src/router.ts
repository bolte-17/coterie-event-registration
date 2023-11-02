import {pipe} from 'pipe-ts';
import {get, post, respond, HttpStatusCode, type Conn} from './routing';
import {createEventRegistration} from './eventRegistration/eventRegistration';

function saveRegistration(conn: Conn) {
  const {body: registration} = conn;
  if (registration instanceof Error) {
    return respond(HttpStatusCode.BAD_REQUEST, registration.message)(conn);
  }

  const result = createEventRegistration(registration);
  if (result.ok) {
    return respond(HttpStatusCode.OK, result.value)(conn);
  }

  return respond(HttpStatusCode.BAD_REQUEST, result.error.message)(conn);
}

export const router = pipe(
  get('/ping', respond(HttpStatusCode.OK, 'pong')),
  post('/create', saveRegistration),
  respond(HttpStatusCode.NOT_FOUND),
);
