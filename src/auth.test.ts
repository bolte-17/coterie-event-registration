import test from 'ava';
import {generateToken, ensureAuth} from './auth';
import {type Conn} from './routing/conn';
import {config} from 'dotenv';

test.before('config environment', () => {
  config();
});

test('valid auth', async t => {
  const token = generateToken();
  const conn: Conn = await ensureAuth('/protected')({
    method: 'get',
    path: '/protected/resource',
    headers: {authorization: 'Bearer ' + token},
    halted: false,
  });
  t.like(conn, {halted: false});
});

test('invalid auth', async t => {
  const conn: Conn = await ensureAuth('/protected')({
    method: 'get',
    path: '/protected/resource',
    headers: {},
    halted: false,
  });
  t.like(conn, {halted: true});
});
