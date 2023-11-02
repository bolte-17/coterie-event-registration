import test from 'ava';
import {validateInput} from './validation';
import {type Err, ok} from '../result';
import type EventRegistrationInput from './eventRegistrationInput';

const goodRegistration: EventRegistrationInput = {
  firstName: 'John',
  lastName: 'Foo',
  email: 'john.foo@example.com',
  age: 30,
  eventType: 'Workshop',
};

test('valid registration', t => {
  t.deepEqual(validateInput(goodRegistration), ok(goodRegistration), 'Valid registration passes validaton');
});

function withoutKey(key: (keyof EventRegistrationInput)) {
  const {[key]: _, ...rest} = goodRegistration;
  return rest;
}

function withKey(key: keyof EventRegistrationInput, value: unknown): unknown {
  return {...goodRegistration, [key]: value};
}

const validationAllows = test.macro({
  exec(t, key: keyof EventRegistrationInput, goodValues: Array<EventRegistrationInput[typeof key]>) {
    goodValues
      .map(v => withKey(key, v))
      .forEach(x => {
        t.deepEqual(validateInput(x), ok(x));
      });
  },

  title(_, key: keyof EventRegistrationInput) {
    return `${key} validation allows valid values`;
  },
});

const validationRejects = test.macro({
  exec(t, key: keyof EventRegistrationInput, messageContains: string, badValues: unknown[]) {
    const regex = new RegExp(`eventRegistration/${key} ${messageContains}`);
    badValues
      .map(v => withKey(key, v))
      .forEach(x => {
        const result = validateInput(x);
        t.like(result, {ok: false});
        t.regex((result as Err<Error>).error.message, regex);
      });
  },

  title(_, key: keyof EventRegistrationInput, messageContains: string) {
    return `${key} ${messageContains}`;
  },
});

test('firstName, lastName, and email fields must be non-empty strings', t => {
  for (const key of ['firstName', 'lastName', 'email'] as const) {
    t.like(validateInput(withoutKey(key)), {ok: false, error: {message: `eventRegistration must have required property '${key}'`}});
    const result = validateInput(withKey(key, ''));
    t.like(result, {ok: false});
    t.regex((result as Err<Error>).error.message, new RegExp(`eventRegistration/${key} must NOT have fewer than 1 characters`));
  }
});

test(validationAllows, 'email', [
  'email@example.com',
  'firstname.lastname@example.com',
  'email@subdomain.example.com',
  'firstname+lastname@example.com',
  'email@123.123.123.123',
  '1234567890@example.com',
  'email@example-one.com',
  '_______@example.com',
  'email@example.name',
  'email@example.museum',
  'email@example.co.jp',
  'firstname-lastname@example.com',
]);
test(validationRejects, 'email', 'must be string', [12]);
test(validationRejects, 'email', 'must match format "email"', [
  'plainaddress',
  '#@%^%#$@#$@#.com',
  '@example.com',
  'Joe Smith <email@example.com>',
  'email.example.com',
  'email@example@example.com',
  'email@example.com (Joe Smith)',
  'email@example..com',
]);

test(validationAllows, 'age', [18, 21, 50, 100]);
test(validationRejects, 'age', 'must be integer', [2.31, 'foo', 18.5]);
test(validationRejects, 'age', 'must be >= 18', [-1, 0, 2.31, 1, 10, 17]);

test(validationAllows, 'eventType', ['Workshop', 'Keynote', 'Panel Discussion']);
test(validationRejects, 'eventType', 'must be equal to one of the allowed values', ['Something', 'Key', 'unknown', 'PanelDiscussion', 12]);

test(validationAllows, 'discountCode', ['EARLYBIRD', 'STUDENT', undefined]);
test(validationRejects, 'discountCode', 'must be equal to one of the allowed values', ['SURLYBIRD', '-20%', 0.15, '']);
