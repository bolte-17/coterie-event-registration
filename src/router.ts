import {get, post, respond, HttpStatusCode, composePlugs} from './routing';
import {saveRegistration} from './endpoints/saveRegistration';

export const routes = [
  get('/ping', respond('pong')),
  post('/create', saveRegistration),
  respond({}, HttpStatusCode.NOT_FOUND),
];

export const router = composePlugs(...routes);
