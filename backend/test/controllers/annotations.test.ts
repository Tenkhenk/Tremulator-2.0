import * as assert from "assert";
import * as Boom from "@hapi/boom";
import * as faker from "faker";
import { createCollection, createImage, dbInitWithUser, jhon, jane, requestJhon, requestJane } from "../utils";
import { AnnotationsController } from "../../src/controllers/annotations";
import { CollectionEntity } from "../../src/entities/collection";

const controller = new AnnotationsController();
let collection;

describe("Test Controller Annotations", () => {
  before(async () => {
    await dbInitWithUser();
    // Create a collection
    collection = await createCollection(requestJhon);
  });

  it("Get an annotation should work", async () => {});
  it("Get an unexisting annotation should return a not found", async () => {});
  it("Get an annotation on a collection that I'm not part of should return a forbidden", async () => {});

  it("Create an annotation should work", async () => {});
  it("Create an annotation on a collection that I'm not part of should return a forbidden", async () => {});
  it("Create an annotation with an invalid json schema should return a bad request", async () => {});

  it("Update an annotation should work", async () => {});
  it("Update an unexisting annotation should return a not found", async () => {});
  it("Update an annotation on a collection that I'm not part of should return a forbidden", async () => {});
  it("Update an annotation with an invalid json value should return a bad request", async () => {});

  it("Delete an annotation should work", async () => {});
  it("Delete an unexisting annotation should return a not found", async () => {});
  it("Delete an annotation on a collection that I'm not part of should return a forbidden", async () => {});
});
