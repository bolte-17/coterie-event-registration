import {type Result, err, ok} from '../result';
import type EventRegistrationInput from './eventRegistrationInput';
import {isEventRegistrationInput, ajv} from './eventRegistrationInput.validator';

export class ValidationError extends Error {}

export function validateInput(input: unknown): Result<EventRegistrationInput> {
  if (isEventRegistrationInput(input)) {
    return ok(input);
  }

  return err(
    new ValidationError(ajv.errorsText(isEventRegistrationInput.errors, {dataVar: 'eventRegistration'})),
  );
}
