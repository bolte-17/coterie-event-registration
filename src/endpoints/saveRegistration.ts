import {pipeWith} from 'pipe-ts';
import {respond} from '../routing/routing';
import {type Conn} from '../routing/conn';
import {createEventRegistration} from '../eventRegistration/eventRegistration';
import {ok, err, bind, bindAsync, asyncly} from '../result';
import {create} from '../cosmos';
import {ValidationError} from '../errors';

export async function saveRegistration(conn: Conn) {
  const {body} = conn;
  const registration = body instanceof Error || body === undefined || body === null
    ? err(body ?? new ValidationError('Expected a body payload representing registration to create'))
    : ok(body);

  return (await pipeWith(registration,
    bind(createEventRegistration),
    bindAsync(async r => create(r).then(ok, err)),
    asyncly(respond),
  ))(conn);
}
