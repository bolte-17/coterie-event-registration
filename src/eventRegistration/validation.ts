import {type Result, err, ok} from '../result';
import type EventRegistrationInput from './eventRegistrationInput';
import {isEventRegistrationInput, ajv} from './eventRegistrationInput.validator';

export function validateInput(input: unknown): Result<EventRegistrationInput> {
  if (isEventRegistrationInput(input)) {
    return ok(input);
  }

  return err(
    Error(ajv.errorsText(isEventRegistrationInput.errors, {dataVar: 'eventRegistration'})),
  );
}
