import t from 'ava';
import {config} from 'dotenv';
import {env} from 'process';
import {getContainer} from './cosmos';

config();
const test = env.NO_DB ? t.skip : t;

test('create container', async t => {
  t.timeout(60 * 10 * 1000);
  const container = await getContainer();
  t.truthy(container);
});
