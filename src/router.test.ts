import test from 'ava';
import {router} from './router';
import {conn} from './routing';
import {type IncomingMessage} from 'http';
import {config} from 'dotenv';

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
