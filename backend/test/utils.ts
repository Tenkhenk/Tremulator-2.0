import * as MockExpressRequest from "mock-express-request";
import { Container } from "typescript-ioc";
import * as faker from "faker";
import { CollectionsController } from "../src/controllers/collections";
import { DbService } from "../src/services/db";
import { UserEntity } from "../src/entities/user";
import { CollectionModel, CollectionEntity } from "../src/entities/collection";
import { ImageModel, ImageEntity } from "../src/entities/image";

// Export user
export const jhon = {
  email: "jhon.doe@yopmail.com",
  firstname: "John",
  lastname: "Doe",
  access_token: "QWERTYUIOP",
  expires_at: new Date(Date.now() + 60 * 1000),
};
export const jane = {
  email: "jane.doe@yopmail.com",
  firstname: "Jane",
  lastname: "Doe",
  access_token: "QWERTYUIOP",
  expires_at: new Date(Date.now() + 60 * 1000),
};

// Mock request
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export const requestJhon = new MockExpressRequest({
  headers: { Authorization: "Bearer QWERTYUIOP" },
  user: jhon,
});
export const requestJane = new MockExpressRequest({
  headers: { Authorization: "Bearer QWERTYUIOP" },
  user: jane,
});
export const requestBadAuth = new MockExpressRequest({ headers: { Authorization: "Bearer POIUYTREWQ" } });
export const requestAnonym = new MockExpressRequest({});

// Db init
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export async function dbInitWithUser(): Promise<void> {
  // init the db connection
  await Container.get(DbService).initialize();
  await Container.get(DbService).getRepository(UserEntity).save(jhon);
  await Container.get(DbService).getRepository(UserEntity).save(jane);
}

// Function to create items
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export async function createCollection(
  request: MockExpressRequest,
  collection?: Omit<CollectionModel, "id">,
): Promise<CollectionModel> {
  const col = collection
    ? collection
    : {
        name: faker.lorem.words(),
        description: faker.lorem.sentences(),
      };
  const controller = new CollectionsController();
  return await controller.create(request, col);
}

export async function createImage(collection: CollectionModel): Promise<ImageModel> {
  // Get collection entity
  const collectionEntity = await Container.get(DbService).getRepository(CollectionEntity).findOne(collection.id);

  const image = await Container.get(DbService).getRepository(ImageEntity).save({
    name: faker.lorem.words(),
    url: faker.internet.url(),
    path: faker.system.filePath(),
    collection: collectionEntity,
  });

  return image;
}
