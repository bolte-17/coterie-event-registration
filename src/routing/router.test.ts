import anyTest, {type TestFn} from 'ava';
import {router} from './router';
import {conn} from './conn';
import {type IncomingMessage} from 'http';
import {env} from 'process';
import {config} from 'dotenv';

config();
const test = anyTest as TestFn<{authHeader: string}>;

test.before('get auth token', async t => {
  const c = await router(conn({method: 'POST', url: '/auth'} as IncomingMessage));
  t.context.authHeader = 'Bearer ' + (c.result?.body as string);
});

const testRoute = test.macro(async (t, {method, url, body}: {method: string; url: string; body?: unknown}, expected: any, authed = true) => {
  const c = conn({
    method,
    url,
    headers: {authorization: authed ? t.context.authHeader : undefined},
  } as IncomingMessage, body);
  t.like((await router(c)).result, expected);
});

const badContentType = Error('Unsupported Media Type');
(badContentType as any).statusCode = 415;

test('healthcheck', testRoute, {method: 'GET', url: '/healthcheck'}, {statusCode: 200, body: 'OK'}, false);
test('not found', testRoute, {method: 'GET', url: '/something-undefined'}, {statusCode: 404}, false);
test('unauthorized', testRoute, {method: 'GET', url: '/api/v1/retrieve?id=1'}, {statusCode: 403}, false);
test('send message', testRoute, {method: 'POST', url: '/api/v1/message'}, {statusCode: 204, body: 'Message Sent'});
test('malformed body', testRoute, {method: 'POST', url: '/api/v1/message', body: badContentType}, {statusCode: 415});

const dbTest = env.NO_DB ? test.skip : test;

dbTest('save and retrieve', async t => {
  const registration = {
    firstName: 'Foo',
    lastName: 'Bar',
    email: 'foobar@example.com',
    eventType: 'Workshop',
    age: 21,
    discountCode: 'STUDENT',
  };

  const {result: saveResult} = await router(
    conn({method: 'POST', url: '/api/v1/create', headers: {authorization: t.context.authHeader}} as IncomingMessage, registration),
  );

  const id = saveResult?.body as string;

  t.like(saveResult, {statusCode: 200});
  t.regex(id, /[a-z0-9-]/);

  const {result: retrieveResult} = await router(
    conn({method: 'GET', url: `/api/v1/retrieve?id=${id}`, headers: {authorization: t.context.authHeader}} as IncomingMessage),
  );

  t.like(retrieveResult, {statusCode: 200});
  t.like(retrieveResult?.body, [{...registration, totalCost: 80}]);
});
