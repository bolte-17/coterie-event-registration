import {get, post, respond, HttpStatusCode, composePlugs} from './routing';
import {saveRegistration, retrieveRegistration, sendMessage} from '../endpoints';
import {generateToken, ensureAuth} from '../auth';

export const routes = [
  get('/healthcheck', respond('OK')),
  post('/auth', respond(generateToken()), {checkBody: false}),
  ensureAuth('/api/v1',
    post('/create', saveRegistration),
    get('/retrieve', retrieveRegistration),
    post('/message', sendMessage),
  ),
  respond({}, HttpStatusCode.NOT_FOUND),
];

export const router = composePlugs(...routes);

