import {get, post, respond, HttpStatusCode, composePlugs} from './routing';
import {saveRegistration, retrieveRegistration} from './endpoints';

export const routes = [
  get('/ping', respond('pong')),
  post('/create', saveRegistration),
  get('/retrieve', retrieveRegistration),
  respond({}, HttpStatusCode.NOT_FOUND),
];

export const router = composePlugs(...routes);
