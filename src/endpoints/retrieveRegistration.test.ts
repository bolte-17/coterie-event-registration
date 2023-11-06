import t from 'ava';
import {config} from 'dotenv';
import {type Conn} from '../routing';
import {env} from 'process';
import {getContainer} from '../cosmos';
import {type EventRegistration} from '../eventRegistration/eventRegistration';
import {retrieveRegistration} from './retrieveRegistration';

config();

let test = t.skip;

const registrations: EventRegistration[] = [
  {
    id: '123e4567-e89b-12d3-a456-9AC7CBDCEE52',
    age: 18,
    email: 'foo@example.com',
    eventType: 'Keynote',
    firstName: 'Foo',
    lastName: 'Bar',
    totalCost: 10,
  },
  {
    id: '234e4567-e89b-12d3-a456-9AC7CBDCEE52',
    age: 18,
    email: 'foo@example.com',
    eventType: 'Panel Discussion',
    firstName: 'Foo',
    lastName: 'Bar',
    totalCost: 100,
  },
  {
    id: '456e4567-e89b-12d3-a456-9AC7CBDCEE52',
    age: 18,
    email: 'baz@example.com',
    eventType: 'Keynote',
    firstName: 'Baz',
    lastName: 'Bar',
    totalCost: 10,
  },
];

if (!env.NO_DB) {
  test = t;
  t.before('ensure test values in DB', async t => {
    const container = await getContainer();
    await Promise.all(registrations.map(async r => container.items.upsert(r)));
  });
}

test('retrieve existing registration by ID', async t => {
  const searchParams = new URLSearchParams(`id=${registrations[0].id}`);
  const {result} = await retrieveRegistration(({searchParams} as Conn));
  t.is(result?.statusCode, 200);
  t.like(
    result?.body,
    [registrations[0]],
  );
});

test('retrieve existing registrations by email', async t => {
  const searchParams = new URLSearchParams(`email=${registrations[0].email}`);
  const {result} = await retrieveRegistration(({searchParams} as Conn));
  t.is(result?.statusCode, 200);
  t.like(
    result?.body,
    [registrations[0], registrations[1]],
  );
});

test('retrieve existing registration by event type', async t => {
  const searchParams = new URLSearchParams(`eventType=${registrations[0].eventType}`);
  const {result} = await retrieveRegistration(({searchParams} as Conn));
  t.is(result?.statusCode, 200);
  t.like(
    result?.body,
    [registrations[0], registrations[2]],
  );
});
