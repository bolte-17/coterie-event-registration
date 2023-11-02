import test from 'ava';
import {applicableDiscounts, eventCost, type EventType, totalCost, type EventRegistration, type DiscountCode} from './eventRegistration';

test('applicableDiscounts', t => {
  t.deepEqual(applicableDiscounts({discountCode: 'STUDENT', age: 10}), []);
  t.deepEqual(applicableDiscounts({discountCode: 'STUDENT', age: 18}), ['STUDENT'], '18');
  t.deepEqual(applicableDiscounts({discountCode: 'STUDENT', age: 25}), ['STUDENT'], '25');
  t.deepEqual(applicableDiscounts({discountCode: 'STUDENT', age: 30}), []);

  t.deepEqual(applicableDiscounts({discountCode: 'EARLYBIRD'}), ['EARLYBIRD']);

  t.deepEqual(applicableDiscounts({discountCode: undefined}), []);
});

test('eventCost', t => {
  t.is(eventCost('Keynote'), 50);
  t.is(eventCost('Panel Discussion'), 30);
  t.is(eventCost('Workshop'), 100);
  t.throws(() => eventCost('Unknown' as EventType));
});

test('totalCost', t => {
  t.is(totalCost({eventType: 'Keynote'}), 50);
  t.is(totalCost({eventType: 'Keynote', discountCode: 'EARLYBIRD'}), 45);
  t.is(totalCost({eventType: 'Workshop', discountCode: 'STUDENT', age: 30}), 100);
  t.is(totalCost({eventType: 'Panel Discussion', discountCode: 'STUDENT', age: 20}), 24);
});
