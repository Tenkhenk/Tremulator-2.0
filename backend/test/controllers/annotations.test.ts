import * as assert from "assert";
import * as Boom from "@hapi/boom";
import * as faker from "faker";
import {
  createAnnotation,
  createCollection,
  createImage,
  createSchema,
  dbInitWithUser,
  jhon,
  jane,
  requestJhon,
  requestJane,
} from "../utils";
import { AnnotationsController } from "../../src/controllers/annotations";
import { CollectionEntity } from "../../src/entities/collection";
import { AnnotationEntity } from "../../src/entities/annotation";

const controller = new AnnotationsController();
let collection, schema, image;

const annotationTemplate = {
  data: {
    foo: 42,
    bar: faker.lorem.words(),
  },
  geometry: {
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
  },
};

describe("Test Controller Annotations", () => {
  before(async () => {
    await dbInitWithUser();
    // Create a collection
    collection = await createCollection(requestJhon);
    // Create an image
    image = await createImage(collection.id);
    // Create a schema
    schema = await createSchema(collection.id);
  });

  it("Get an annotation should work", async () => {
    // Create an annotation
    const annotation = await createAnnotation(collection.id, image.id, schema.id);

    const result = await controller.get(requestJhon, collection.id, image.id, annotation.id);

    // Check the reponse
    assert.deepEqual(result.data, annotation.data);
    assert.deepEqual(result.geometry, annotation.geometry);
    assert.equal(result.id > 0, true);
  });

  it("Get an unexisting annotation should return a not found", async () => {
    await assert.rejects(
      controller.get(requestJhon, collection.id, image.id, -1),
      Boom.notFound("Annotation not found"),
    );
  });

  it("Get an annotation on a collection that I'm not part of should return a forbidden", async () => {
    // Create an annotation
    const annotation = await createAnnotation(collection.id, image.id, schema.id);

    await assert.rejects(controller.get(requestJane, collection.id, image.id, -1), Boom.forbidden());
  });

  it("Create an annotation should work", async () => {
    // Do the call
    const result = await controller.create(requestJhon, collection.id, image.id, annotationTemplate, schema.id);

    // Check the reponse
    assert.deepEqual(result.data, annotationTemplate.data);
    assert.deepEqual(result.geometry, annotationTemplate.geometry);
    assert.equal(result.id > 0, true);
  });

  it("Create an annotation on a collection that I'm not part of should return a forbidden", async () => {
    await assert.rejects(
      controller.create(requestJane, collection.id, image.id, annotationTemplate, schema.id),
      Boom.forbidden(),
    );
  });

  it("Create an annotation with invalid data should return a bad request", async () => {
    const annotation = Object.assign(annotationTemplate, { data: { foo: -1, bar: "hello" } });
    await assert.rejects(
      controller.create(requestJhon, collection.id, image.id, annotationTemplate, schema.id),
      Boom.badRequest("Data validation failed"),
    );
  });

  it("Update an annotation should work", async () => {
    // Create an annotation
    const annotation = await createAnnotation(collection.id, image.id, schema.id);

    // Do the call
    await assert.doesNotReject(
      controller.update(
        requestJhon,
        collection.id,
        image.id,
        annotation.id,
        Object.assign({}, annotation, { data: { foo: 10, bar: "TEST" } }),
      ),
    );

    // Check the db
    const dbItem = await AnnotationEntity.findOne(annotation.id);
    assert.deepEqual(dbItem.data, { foo: 10, bar: "TEST" });
    assert.deepEqual(dbItem.geometry, annotation.geometry);
  });

  it("Update an unexisting annotation should return a not found", async () => {
    await assert.rejects(
      controller.update(requestJhon, collection.id, image.id, -1, annotationTemplate),
      Boom.notFound("Annotation not found"),
    );
  });

  it("Update an annotation on a collection that I'm not part of should return a forbidden", async () => {
    // Create an annotation
    const annotation = await createAnnotation(collection.id, image.id, schema.id);

    await assert.rejects(
      controller.update(requestJane, collection.id, image.id, annotation.id, annotationTemplate),
      Boom.forbidden(),
    );
  });

  it("Update an annotation with invalid data value should return a bad request", async () => {
    // Create an annotation
    const annotation = await createAnnotation(collection.id, image.id, schema.id);

    await assert.rejects(
      controller.create(
        requestJhon,
        collection.id,
        image.id,
        Object.assign(annotationTemplate, { data: { foo: -1, bar: "hello" } }),
        schema.id,
      ),
      Boom.badRequest("Data validation failed"),
    );
  });

  it("Delete an annotation should work", async () => {
    const annotation = await createAnnotation(collection.id, image.id, schema.id);
    await controller.delete(requestJhon, collection.id, image.id, annotation.id);

    // Check that schema doesn't exist
    await assert.rejects(
      controller.get(requestJhon, collection.id, image.id, annotation.id),
      Boom.notFound("Annotation not found"),
    );
  });

  it("Delete an unexisting annotation should return a not found", async () => {
    await assert.rejects(
      controller.delete(requestJhon, collection.id, image.id, -1),
      Boom.notFound("Annotation not found"),
    );
  });

  it("Delete an annotation on a collection that I'm not part of should return a forbidden", async () => {
    const annotation = await createAnnotation(collection.id, image.id, schema.id);
    await assert.rejects(controller.delete(requestJane, collection.id, image.id, annotation.id), Boom.forbidden());
  });
});
