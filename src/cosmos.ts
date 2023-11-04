import {CosmosClient, type ItemDefinition, type Container} from '@azure/cosmos';
import {config} from 'dotenv';
import {env} from 'process';

export type Persisted<T> = T & {id: string};

config();

const client = new CosmosClient({
  endpoint: env.COSMOS_ENDPOINT!,
  key: env.COSMOS_KEY,
});

const containerInit = client.databases.createIfNotExists({id: env.COSMOS_DATABASE})
  .then(async d => d.database.containers.createIfNotExists({id: env.COSMOS_CONTAINER}))
  .then(cr => cr.container);

export async function getContainer() {
  return containerInit;
}

export async function create(item: ItemDefinition) {
  const container = await getContainer();
  const response = await container.items.create(item);
  return response.item.id;
}

export async function fetch<T extends ItemDefinition>(id: NonNullable<T['id']>): Promise<Persisted<T> | undefined> {
  const container = await getContainer();
  const response = await container.item(id).read<Persisted<T>>();
  return response.resource;
}
