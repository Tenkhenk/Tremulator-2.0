import * as assert from "assert";
import * as Boom from "@hapi/boom";
import * as faker from "faker";
import { createCollection, createImage, dbInitWithUser, jhon, jane, requestJhon, requestJane } from "../utils";
import { SchemaController } from "../../src/controllers/schema";
import { CollectionEntity } from "../../src/entities/collection";

const controller = new SchemaController();
let collection;

describe("Test Controller Schema", () => {
  before(async () => {
    await dbInitWithUser();
    // Create a collection
    collection = await createCollection(requestJhon);
  });

  it("Get a schema should work", async () => {});
  it("Get an unexisting schema should return a not found", async () => {});
  it("Get a schema on a collection that I'm not part of should return a forbidden", async () => {});

  it("Create a schema should work", async () => {});
  it("Create a schema on a collection that I'm not part of should return a forbidden", async () => {});
  it("Create a schema with an invalid json schema should return a bad request", async () => {});

  it("Update a schema should work", async () => {});
  it("Update an unexisting schema should return a not found", async () => {});
  it("Update a schema on a collection that I'm not part of should return a forbidden", async () => {});
  it("Update a schema with an invalid json schema should return a bad request", async () => {});

  it("Delete a schema should work", async () => {});
  it("Delete an unexisting schema should return a not found", async () => {});
  it("Delete a schema on a collection that I'm not part of should return a forbidden", async () => {});
});
