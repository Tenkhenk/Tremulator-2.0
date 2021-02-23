import * as assert from "assert";
import * as Boom from "@hapi/boom";
import * as faker from "faker";
import { createCollection, createImage, dbInitWithUser, jhon, jane, requestJhon, requestJane } from "../utils";
import { ImagesController } from "../../src/controllers/images";
import { CollectionEntity } from "../../src/entities/collection";

const controller = new ImagesController();
let collection;

describe("Test Controller Images", () => {
  before(async () => {
    await dbInitWithUser();
    // Create a collection
    collection = await createCollection(requestJhon);
  });

  it("Create an image by given urls should work", async () => {
    const result = await controller.download(requestJhon, collection.id, {
      urls: ["https://www.wikipedia.org/static/apple-touch/wikipedia.png"],
    });

    // Check the response
    assert.equal(result.length === 1, true);
    assert.equal(result[0].name, "wikipedia.png");
  });

  it("Create an image by given urls that point to an unauthorized file should not work", async () => {
    await assert.rejects(
      controller.download(requestJhon, collection.id, {
        urls: ["https://www.wikipedia.org/static/favicon/wikipedia.ico"],
      }),
      Boom.unsupportedMediaType(),
    );
  });

  it("Get an image should work", async () => {
    const image = await createImage(collection);
    const result = await controller.get(requestJhon, collection.id, image.id);

    // Check the reponse
    assert.equal(result.name, image.name);
    assert.equal(result.url, image.url);
    assert.equal(result.id > 0, true);
  });

  it("Update an image should work", async () => {
    const image = await createImage(collection);

    // update the image
    await controller.update(requestJhon, collection.id, image.id, Object.assign({}, image, { name: "TEST" }));

    // retrieve it for checks
    const result = await controller.get(requestJhon, collection.id, image.id);
    assert.equal(result.name, "TEST");
    assert.equal(result.url, image.url);
  });

  it("Delete an image should work", async () => {
    const image = await createImage(collection);

    // delete the image
    await assert.doesNotReject(controller.delete(requestJhon, collection.id, image.id));

    // Check that image is delete
    await assert.rejects(controller.get(requestJhon, collection.id, image.id), Boom.notFound("Image not found"));
  });

  it("Get an unexisting image should return a not found", async () => {
    await assert.rejects(controller.get(requestJhon, collection.id, -1), Boom.notFound("Image not found"));
  });

  it("Get an image on a collection that I'm not part of, should return a forbidden", async () => {
    const image = await createImage(collection);
    await assert.rejects(controller.get(requestJane, collection.id, image.id), Boom.forbidden());
  });

  it("Get an unexisting image on a collection that I'm not part of, should return a forbidden", async () => {
    await assert.rejects(controller.get(requestJane, collection.id, -1), Boom.forbidden());
  });

  it("Update an image of a collection that I'm not part of, should return a forbidden", async () => {
    const image = await createImage(collection);
    await assert.rejects(
      controller.update(requestJane, collection.id, image.id, Object.assign({}, image, { name: "TEST" })),
      Boom.forbidden(),
    );
  });

  it("Delete an image of a collection that I'm not part of, should return a forbidden", async () => {
    const image = await createImage(collection);
    await assert.rejects(controller.delete(requestJane, collection.id, image.id), Boom.forbidden());
  });
});
