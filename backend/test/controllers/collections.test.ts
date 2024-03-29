import * as assert from "assert";
import * as Boom from "@hapi/boom";
import * as faker from "faker";
import {
  createCollection,
  dbInitWithUser,
  jhon,
  jane,
  ann,
  requestAnonym,
  requestJhon,
  requestJane,
  requestAnn,
} from "../utils";
import { CollectionsController } from "../../src/controllers/collections";
import { CollectionEntity, CollectionData } from "../../src/entities/collection";

const controller = new CollectionsController();

describe("Test Controller Collections", () => {
  before(async () => {
    await dbInitWithUser();
  });

  it("Search collection should work", async () => {
    // Create a collection
    const collection = await createCollection(requestJhon);
    // API call
    const result = await controller.search(requestJhon, collection.name, 0, 10);
    // Check the response
    assert.equal(result.length > 0, true);
  });

  it("Create collection should work", async () => {
    // Create a collection
    const collection: CollectionData = {
      name: faker.lorem.words(),
      description: faker.lorem.sentences(),
    };
    const result = await createCollection(requestJhon, collection);

    // Check the reponse
    assert.equal(result.name, collection.name);
    assert.equal(result.description, collection.description);
    assert.equal(result.id > 0, true);

    // Check the db
    const dbColl = await CollectionEntity.findOne(result.id, { relations: ["owner"] });
    assert.equal(dbColl.name, collection.name);
    assert.equal(dbColl.description, collection.description);
    assert.equal(dbColl.owner.email, jhon.email);
  });

  it("Update collection by the owner should work", async () => {
    // Create a collection
    const collection = await createCollection(requestJhon);

    // API call
    await assert.doesNotReject(
      controller.update(requestJhon, collection.id, { name: "TEST", description: collection.description }),
    );

    // Check the db
    const dbColl = await CollectionEntity.findOne(collection.id, { relations: ["owner"] });
    assert.equal(dbColl.name, "TEST");
    assert.equal(dbColl.description, collection.description);
    assert.equal(dbColl.owner.email, jhon.email);
  });

  it("Delete collection by the owner should work", async () => {
    // Create a collection
    const collection = await createCollection(requestJhon);

    // API call
    await assert.doesNotReject(controller.delete(requestJhon, collection.id));

    // Check the db
    const dbColl = await CollectionEntity.findOne(collection.id);
    assert.equal(dbColl === undefined, true);
  });

  it("Delete collection by a member should fail", async () => {
    // Create a collection
    const collection = await createCollection(requestJhon);
    // Add Jane to the collection
    await assert.doesNotReject(controller.userAdd(requestJhon, collection.id, { email: jane.email }));

    // API call
    await assert.rejects(
      controller.delete(requestJane, collection.id),
      Boom.forbidden("Only available for collection's owner"),
    );
  });

  it("Add / Delete a user on a collection by member should fail", async () => {
    // Create a collection
    const collection = await createCollection(requestJhon);
    // Add Jane to the collection
    await assert.doesNotReject(controller.userAdd(requestJhon, collection.id, { email: jane.email }));
    // Test if Jane has acces to the collection
    await assert.doesNotReject(controller.get(requestJane, collection.id));

    // Test if Jane can remove Jhon
    await assert.rejects(
      controller.userDelete(requestJane, collection.id, { email: jhon.email }),
      Boom.forbidden("Only available for collection's owner"),
    );
    // Test if Jane can add Ann
    await assert.rejects(
      controller.userAdd(requestJane, collection.id, { email: ann.email }),
      Boom.forbidden("Only available for collection's owner"),
    );
  });

  it("Search collection with a user that has no collection should return an empty result", async () => {
    // Create a collection
    const collection = await createCollection(requestJhon);
    // API call
    const result = await controller.search(requestJane, collection.name, 0, 10);
    // Check the response
    assert.equal(result.length === 0, true);
  });

  it("Update collection with an unauthorized user should failed", async () => {
    // Create a collection with Jhon
    const collection = await createCollection(requestJhon);

    // API call with Jane
    await assert.rejects(
      controller.update(requestJane, collection.id, { ...collection, name: "TEST" }),
      Boom.forbidden(),
    );
  });

  it("Delete collection with an unauthorized user should failed", async () => {
    // Create a collection with Jhon
    const collection = await createCollection(requestJhon);

    // API call with Jane
    await assert.rejects(controller.delete(requestJane, collection.id), Boom.forbidden());
  });
});
