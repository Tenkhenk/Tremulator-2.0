import * as assert from "assert";
import * as Boom from "@hapi/boom";
import * as faker from "faker";
import { JSONSchema7 } from "json-schema";
import {
  createCollection,
  createImage,
  createSchema,
  dbInitWithUser,
  jhon,
  jane,
  requestJhon,
  requestJane,
} from "../utils";
import { SchemaController } from "../../src/controllers/schema";
import { CollectionEntity } from "../../src/entities/collection";
import { SchemaEntity } from "../../src/entities/schema";

const controller = new SchemaController();
let collection;

const jsonSchema: JSONSchema7 = {
  type: "object",
  properties: {
    foo: { type: "number", minimum: 0 },
    bar: { type: "string" },
  },
  required: ["foo", "bar"],
};
const invalidJsonSchema: JSONSchema7 = ({
  type: "object",
  properties: {
    foo: { type: "number", minimum: 0 },
    bar: { type: "blabla" },
  },
  required: ["foo", "bar"],
} as unknown) as JSONSchema7;

describe("Test Controller Schema", () => {
  before(async () => {
    await dbInitWithUser();
    // Create a collection
    collection = await createCollection(requestJhon);
  });

  it("Get a schema should work", async () => {
    // Create a schema
    const schema = await createSchema(collection);

    const result = await controller.get(requestJhon, collection.id, schema.id);

    // Check the reponse
    assert.equal(result.name, schema.name);
    assert.deepEqual(result.schema, schema.schema);
    assert.equal(result.id > 0, true);
  });

  it("Get an unexisting schema should return a not found", async () => {
    await assert.rejects(controller.get(requestJhon, collection.id, -1), Boom.notFound("Schema not found"));
  });

  it("Get a schema on a collection that I'm not part of should return a forbidden", async () => {
    await assert.rejects(controller.get(requestJane, collection.id, -1), Boom.forbidden());
  });

  it("Create a schema should work", async () => {
    const schema = {
      name: faker.lorem.words(),
      schema: jsonSchema,
    };

    // Do the call
    const result = await controller.create(requestJhon, collection.id, schema);

    // Check the reponse
    assert.equal(result.name, schema.name);
    assert.deepEqual(result.schema, schema.schema);
    assert.equal(result.id > 0, true);
  });

  it("Create a schema on a collection that I'm not part of should return a forbidden", async () => {
    const schema = {
      name: faker.lorem.words(),
      schema: jsonSchema,
    };

    await assert.rejects(controller.create(requestJane, collection.id, schema), Boom.forbidden());
  });

  it("Create a schema with an invalid json schema should return a bad request", async () => {
    const schema = {
      name: faker.lorem.words(),
      schema: invalidJsonSchema,
    };

    await assert.rejects(controller.create(requestJhon, collection.id, schema), Boom.badRequest("Schema is invalid"));
  });

  it("Update a schema should work", async () => {
    // Create a schema
    const schema = await createSchema(collection);

    // Do the call
    await assert.doesNotReject(
      controller.update(requestJhon, collection.id, schema.id, Object.assign({}, schema, { name: "TEST" })),
    );

    // Check the db
    const dbItem = await SchemaEntity.findOne(schema.id);
    assert.equal(dbItem.name, "TEST");
    assert.deepEqual(dbItem.schema, schema.schema);
  });

  it("Update an unexisting schema should return a not found", async () => {
    await assert.rejects(
      controller.update(requestJhon, collection.id, -1, { name: "TEST", schema: {} }),
      Boom.notFound("Schema not found"),
    );
  });

  it("Update a schema on a collection that I'm not part of should return a forbidden", async () => {
    // Create a schema
    const schema = await createSchema(collection);

    await assert.rejects(
      controller.update(requestJane, collection.id, schema.id, Object.assign({}, schema, { name: "TEST", schema: {} })),
      Boom.forbidden(),
    );
  });

  it("Update a schema with an invalid json schema should return a bad request", async () => {
    // Create a schema
    const schema = await createSchema(collection);

    await assert.rejects(
      controller.update(
        requestJhon,
        collection.id,
        schema.id,
        Object.assign({}, schema, {
          name: "TEST",
          schema: invalidJsonSchema,
        }),
      ),
      Boom.badRequest("Schema is invalid"),
    );
  });

  it("Delete a schema should work", async () => {
    // Create a schema
    const schema = await createSchema(collection);

    // Delete the schema
    const result = await controller.delete(requestJhon, collection.id, schema.id);

    // Check that schema doesn't exist
    await assert.rejects(controller.get(requestJhon, collection.id, schema.id), Boom.notFound("Schema not found"));
  });

  it("Delete an unexisting schema should return a not found", async () => {
    await assert.rejects(controller.delete(requestJhon, collection.id, -1), Boom.notFound("Schema not found"));
  });

  it("Delete a schema on a collection that I'm not part of should return a forbidden", async () => {
    // Create a schema
    const schema = await createSchema(collection);

    await assert.rejects(controller.delete(requestJane, collection.id, schema.id), Boom.forbidden());
  });
});
