import {pipeWith} from 'pipe-ts';
import {respond, type Conn} from '../routing';
import {createEventRegistration} from '../eventRegistration/eventRegistration';
import {ok, err, bind, bindAsync, asyncly} from '../result';
import {create} from '../cosmos';
import {ValidationError} from '../eventRegistration/validation';

export async function saveRegistration(conn: Conn) {
  const {body} = conn;
  const registration = body instanceof Error || body === undefined || body === null
    ? err(body ?? new ValidationError('Expected a body payload representing registration to create'))
    : ok(body);

  return (await pipeWith(registration,
    bind(createEventRegistration),
    bindAsync(async r => create({...r, id: undefined}).then(ok, err)),
    asyncly(respond))
  )(conn);
}
