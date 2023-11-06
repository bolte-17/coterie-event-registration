import {type Persisted, fetch, getContainer} from '../cosmos';
import {ArgumentError} from '../errors';
import {type EventRegistration} from '../eventRegistration/eventRegistration';
import {type Result, ok, err} from '../result';
import {respond, type Conn} from '../routing';

export async function retrieveRegistration(conn: Conn) {
  const result = await fetchRegistrations(conn.searchParams);

  return respond(result)(conn);
}

async function fetchRegistrations(searchParams: URLSearchParams): Promise<Result<Array<Persisted<EventRegistration>>>> {
  if (searchParams.has('id')) {
    return fetchById(searchParams.get('id')!).then(r => r === undefined ? ok([]) : ok([r]));
  }

  if (searchParams.has('eventType')) {
    return fetchAllByProperty('eventType', searchParams.get('eventType')!).then(ok);
  }

  if (searchParams.has('email')) {
    return fetchAllByProperty('email', searchParams.get('email')!).then(ok);
  }

  return Promise.resolve(err(new ArgumentError('Retrieve endpoint must specify one of id, email, or event type')));
}

async function fetchById(id: string) {
  return fetch<EventRegistration>(id);
}

async function fetchAllByProperty(propertyName: 'eventType' | 'email', value: string) {
  const container = await getContainer();

  const response = await (container.items.query<Persisted<EventRegistration>>({
    query: `SELECT * FROM registrations r WHERE r.${propertyName} = @value`,
    parameters: [
      {name: '@value', value},
    ],
  })).fetchAll();

  return response.resources;
}
