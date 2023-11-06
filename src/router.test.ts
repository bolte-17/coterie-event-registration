import test from 'ava';
import {router} from './router';
import {conn} from './routing';
import {type IncomingMessage} from 'http';
import {env} from 'process';
import {config} from 'dotenv';

config();

test('ping', async t => {
  t.like(
    await router(conn({method: 'GET', url: '/ping'} as IncomingMessage)),
    {result: {statusCode: 200, body: 'pong'}},
  );
});

test('not found', async t => {
  t.like(
    await router(conn({method: 'GET', url: '/something-undefined'} as IncomingMessage)),
    {result: {statusCode: 404}},
  );
});

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
    conn(
      {method: 'POST', url: '/create'} as IncomingMessage,
      registration,
    ),
  );

  const id = saveResult?.body as string;

  t.like(saveResult, {statusCode: 200});
  t.regex(id, /[a-z0-9-]/);

  const {result: retrieveResult} = await router(
    conn({method: 'GET', url: `/retrieve?id=${id}`} as IncomingMessage),
  );

  t.like(retrieveResult, {statusCode: 200});
  t.like(retrieveResult?.body, [{...registration, totalCost: 80}]);
});

test('send message', async t => {
  t.like(
    await router(
      conn({method: 'POST', url: '/message'} as IncomingMessage, {foo: 'bar'}),
    ),
    {result: {statusCode: 204, body: 'Message Sent'}},
  );
});
