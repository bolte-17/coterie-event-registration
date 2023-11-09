import t from 'ava';
import {config} from 'dotenv';
import {saveRegistration} from './saveRegistration';
import {type Conn} from '../routing/conn';
import {env} from 'process';

config();

const test = env.NO_DB ? t.skip : t;

test('create registration success', async t => {
  const registration = {
    age: 18,
    email: 'example@example.com',
    firstName: 'example',
    lastName: 'example',
    eventType: 'Workshop',
  };

  t.timeout(20000);
  const {result} = await saveRegistration({body: registration} as Conn);

  t.is(result?.statusCode, 200);
  t.regex(result?.body as string, /[0-9a-fA-F-]/);
});

test('create registration invalid', async t => {
  t.like(
    await saveRegistration({body: {}} as Conn),
    {result: {statusCode: 400}},
  );
});
