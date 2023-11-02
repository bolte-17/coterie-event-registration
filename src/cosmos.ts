import {CosmosClient, type ItemDefinition, type Container} from '@azure/cosmos';
import {env} from 'process';

export type Persisted<T> = T & {id: string};

export async function getContainer() {
  const client = new CosmosClient({
    endpoint: env.COSMOS_ENDPOINT!,
    key: env.COSMOS_KEY,
  });
  const {database} = await client.databases.createIfNotExists({id: env.COSMOS_DATABASE});
  const {container} = await database.containers.createIfNotExists({id: env.COSMOS_CONTAINER});
  return container;
}

export async function create(item: ItemDefinition) {
  const container = await getContainer();
  const response = await container.items.create(item, {disableAutomaticIdGeneration: false});
  return response.item.id;
}

export async function fetch<T extends ItemDefinition>(container: Container, id: NonNullable<T['id']>): Promise<Persisted<T> | undefined> {
  const response = await container.item(id).read<Persisted<T>>();
  console.log(response);
  return response.resource;
}
