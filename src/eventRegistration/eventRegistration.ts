import {pipeWith} from 'pipe-ts';
import {type Result, map} from '../result';
import {validateInput} from './validation';

export type EventType = 'Workshop' | 'Keynote' | 'Panel Discussion';
export type DiscountCode = 'EARLYBIRD' | 'STUDENT';
export type EventRegistration = {
  id?: string;
  /**
   * @minLength 1
   */
  firstName: string;
  /**
   * @minLength 1
   */
  lastName: string;
  /**
   * @minLength 1
   * @TJS-format email
   */
  email: string;
  /**
   * @minimum 18
   * @TJS-type integer
   */
  age: number;
  eventType: EventType;
  discountCode?: DiscountCode;
  totalCost: number;
};

export function isDiscountCode(s: string | undefined): s is DiscountCode {
  return ['EARLYBIRD', 'STUDENT'].includes(s!);
}

export function eventCost(eventType: EventType) {
  switch (eventType) {
    case 'Workshop': return 100;
    case 'Keynote': return 50;
    case 'Panel Discussion': return 30;
    default: unknownEventType(eventType);
  }

  // Never-typed argument means non-exhaustive switch gets caught by TS
  function unknownEventType(e: never): never {
    throw new Error(`Unknown event type '${String(e)}'`);
  }
}

type Discountable =
  {discountCode: 'STUDENT'; age: number} |
  {discountCode: 'EARLYBIRD'} |
  {discountCode?: undefined};
const discountRequirements = new Map<DiscountCode, (r: Discountable) => boolean>([
  ['STUDENT', r => r.discountCode === 'STUDENT' && r.age >= 18 && r.age <= 25],
]);

export function applicableDiscounts(registration: Discountable): DiscountCode[] {
  return [registration.discountCode]
    .filter(isDiscountCode)
    .filter(x => discountRequirements.get(x)?.(registration) ?? true);
}

function discountMultiplier(discountCode: DiscountCode): number {
  switch (discountCode) {
    case 'EARLYBIRD': return 0.9;
    case 'STUDENT': return 0.8;
    default: return 1;
  }
}

export function totalCost(registration: Discountable & Pick<EventRegistration, 'eventType'>) {
  // Handling monetary values in the system should ideally be done in a more robust (non-float) way
  return eventCost(registration.eventType)
    * applicableDiscounts(registration)
      .map(discountMultiplier)
      .reduce((x, y) => x * y, 1);
}

export function createEventRegistration(input: unknown): Result<EventRegistration> {
  const result = pipeWith(input,
    validateInput,
    map(x => ({...x, totalCost: totalCost(x)})),
  );

  return result;
}
