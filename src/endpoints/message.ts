import {ServiceBusClient, type ServiceBusSender} from '@azure/service-bus';
import {env} from 'process';
import {respond, type Conn, HttpStatusCode} from '../routing';

function createSender() {
  if (env.SERVICE_BUS_CONNECTION_STRING) {
    return new ServiceBusClient(env.SERVICE_BUS_CONNECTION_STRING).createSender(env.SERVICE_BUS_QUEUE_NAME ?? 'queue');
  }

  const sendMessages: ServiceBusSender['sendMessages'] = async messages => {
    console.log(messages);
  };

  return {sendMessages};
}

export async function sendMessage(conn: Conn) {
  const result = await createSender().sendMessages({body: conn.body})
    .then(
      () => respond('Message Sent', 204),
      e => respond(e, HttpStatusCode.INTERNAL_SERVER_ERROR));
  return result(conn);
}
