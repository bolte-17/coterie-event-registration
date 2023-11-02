import {type EventRegistration} from './eventRegistration';

export type EventRegistrationInput = Omit<EventRegistration, 'id' | 'totalCost'>;
export default EventRegistrationInput;
