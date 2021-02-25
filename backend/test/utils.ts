import * as MockExpressRequest from "mock-express-request";
import { Container } from "typescript-ioc";
import * as faker from "faker";
import { CollectionsController } from "../src/controllers/collections";
import { DbService } from "../src/services/db";
import { UserEntity } from "../src/entities/user";
import { CollectionModel, CollectionEntity } from "../src/entities/collection";
import { ImageModel, ImageEntity } from "../src/entities/image";
import { SchemaModel, SchemaEntity } from "../src/entities/schema";
import { AnnotationModel, AnnotationEntity } from "../src/entities/annotation";

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
export const ann = {
  email: "ann.onym@yopmail.com",
  firstname: "Ann",
  lastname: "Onym",
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
export const requestAnn = new MockExpressRequest({
  headers: { Authorization: "Bearer QWERTYUIOP" },
  user: ann,
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
  await Container.get(DbService).getRepository(UserEntity).save(ann);
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

export async function createImage(collectionId: number): Promise<ImageModel> {
  // Get collection entity
  const collectionEntity = await Container.get(DbService).getRepository(CollectionEntity).findOne(collectionId);

  const image = await Container.get(DbService).getRepository(ImageEntity).save({
    name: faker.lorem.words(),
    url: faker.internet.url(),
    path: faker.system.filePath(),
    collection: collectionEntity,
  });

  return image;
}

export async function createSchema(collectionId: number): Promise<SchemaModel> {
  // Get collection entity
  const collectionEntity = await Container.get(DbService).getRepository(CollectionEntity).findOne(collectionId);

  const schema = await Container.get(DbService)
    .getRepository(SchemaEntity)
    .save({
      name: faker.lorem.words(),
      schema: {
        type: "object",
        properties: {
          foo: { type: "number", minimum: 0 },
          bar: { type: "string" },
        },
        required: ["foo", "bar"],
      },
      collection: collectionEntity,
    });

  return schema;
}

export async function createAnnotation(
  collectionId: number,
  imageId: number,
  schemaId: number,
): Promise<AnnotationModel> {
  // Get collection entity
  const collectionEntity = await Container.get(DbService).getRepository(CollectionEntity).findOne(collectionId);
  // Get collection entity
  const imageEntity = await Container.get(DbService).getRepository(ImageEntity).findOne(imageId);
  // Get schema entity
  const schemaEntity = await Container.get(DbService).getRepository(SchemaEntity).findOne(schemaId);

  const geom = {
    type: "Polygon",
    coordinates: [
      [
        [100.0, 0.0],
        [101.0, 0.0],
        [101.0, 1.0],
        [100.0, 1.0],
        [100.0, 0.0],
      ],
    ],
  };
  const annotation = await Container.get(DbService)
    .getRepository(AnnotationEntity)
    .save({
      data: {
        foo: 42,
        bar: faker.lorem.words(),
      },
      geometry: geom,
      image: imageEntity,
      schema: schemaEntity,
    } as AnnotationEntity);

  return annotation;
}
