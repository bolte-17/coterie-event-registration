import test from 'ava';
import {router} from './router';
import {conn} from './routing';
import {type IncomingMessage} from 'http';

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

test('create registration success', async t => {
  const registration = {
    age: 18,
    email: 'example@example.com',
    firstName: 'example',
    lastName: 'example',
    eventType: 'Workshop',
  };

  t.like(
    await router(conn({method: 'POST', url: '/create'} as IncomingMessage, registration)),
    {result: {statusCode: 200, body: {...registration, totalCost: 100}}},
  );
});

test('create registration invalid', async t => {
  t.like(
    await router(conn({method: 'POST', url: '/create'} as IncomingMessage, {})),
    {result: {statusCode: 400}},
  );
});
