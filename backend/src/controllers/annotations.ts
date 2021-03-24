import { Body, Get, Post, Put, Delete, Route, Response, Query, Path, Security, Request, Tags } from "tsoa";
import { Inject } from "typescript-ioc";
import * as express from "express";
import { getRepository } from "typeorm";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import * as Boom from "@hapi/boom";
import Ajv from "ajv";
import * as gjv from "geojson-validation";
import { DefaultController, ExpressAuthRequest } from "./default";
import { getLogger, Logger } from "../services/logger";
import { DbService } from "../services/db";
import { SchemaEntity } from "../entities/schema";
import {
  AnnotationEntity,
  annotationEntityToModel,
  annotationEntityToModelFull,
  AnnotationData,
  AnnotationModel,
  AnnotationModelFull,
} from "../entities/annotation";
import { In } from "typeorm";

@Tags("Annotations")
@Route("collections")
export class AnnotationsController extends DefaultController {
  // logger
  private log: Logger = getLogger("AnnotationsController");
  @Inject
  private db: DbService;

  @Post("{collectionId}/images/{imageId}/annotations")
  @Security("auth")
  @Response("201", "Created")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not Found")
  @Response("500", "Internal Error")
  @Response("500", "Internal Error")
  public async create(
    @Request() req: ExpressAuthRequest,
    @Path() collectionId: number,
    @Path() imageId: number,
    @Body() body: AnnotationData,
    @Query() schemaId?: number,
  ): Promise<AnnotationModel> {
    // Retrieve the image
    const image = await this.getImage(req, collectionId, imageId);

    // Retrieve the list of schema of the collection
    const schemas = await SchemaEntity.find({ where: { collection: collectionId } });

    // Take the schema specified in params
    // If not specified and the collection has only one schema, we take it
    let schema: SchemaEntity | null = null;
    if (schemaId) {
      schema = schemas.find((item) => item.id === schemaId);
    } else {
      if (schemas.length === 1) {
        schema = schemas[0];
      }
    }
    if (!schema) throw Boom.badRequest("Schema is mandatory");

    // Validate the body
    const errors = await validate(plainToClass(AnnotationEntity, body));
    this.classValidationErrorToHttpError(errors);

    // validate the data
    const ajv = new Ajv();
    const validateJson = await ajv.compile(schema.schema);
    if (!validateJson(body.data)) {
      this.log.info("Data validation failed", validateJson.errors);
      throw Boom.badRequest("Data validation failed");
    }

    // validate geojson
    if (!gjv.valid(body.geometry)) throw Boom.badRequest("Geometry is invalid");

    // Save & return the collection
    const annotation = await this.db
      .getRepository(AnnotationEntity)
      .save({ ...(body as AnnotationEntity), image, schema });
    this.setStatus(201);

    return annotationEntityToModel(annotation);
  }

  @Get("{collectionId}/images/{imageId}/annotations/{id}")
  @Security("auth")
  @Response("200", "Success")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not Found")
  @Response("500", "Internal Error")
  public async get(
    @Request() req: ExpressAuthRequest,
    @Path() collectionId: number,
    @Path() imageId: number,
    @Path() id: number,
  ): Promise<AnnotationModelFull> {
    // Retrieve the image
    const image = await this.getImage(req, collectionId, imageId);

    // Search the annotation
    const annotation = await AnnotationEntity.findOne(id, { relations: ["image", "schema"] });
    if (!annotation || annotation.image.id !== image.id) throw Boom.notFound("Annotation not found");

    return annotationEntityToModelFull(annotation);
  }

  @Put("{collectionId}/images/{imageId}/annotations/{id}")
  @Security("auth")
  @Response("204", "No Content")
  @Response("400", "Bad request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not found")
  @Response("500", "Internal Error")
  public async update(
    @Request() req: ExpressAuthRequest,
    @Path() collectionId: number,
    @Path() imageId: number,
    @Path() id: number,
    @Body() body: AnnotationData,
  ): Promise<void> {
    // Retrieve the image
    const image = await this.getImage(req, collectionId, imageId);

    // Search the annotation
    const annotation = await AnnotationEntity.findOne(id, { relations: ["image", "schema"] });
    if (!annotation || annotation.image.id !== image.id) throw Boom.notFound("Annotation not found");

    // Validate the body
    const errors = await validate(plainToClass(AnnotationEntity, body));
    this.classValidationErrorToHttpError(errors);
    // Validate data
    const ajv = new Ajv();
    const validateJson = await ajv.compile(annotation.schema.schema);
    if (!validateJson(body.data)) {
      this.log.info("Data validation failed", validateJson.errors);
      throw Boom.badRequest("Data validation failed");
    }
    // validate geojson
    if (!gjv.valid(body.geometry)) throw Boom.badRequest("Geometry is invalid");

    // Save & return the collection
    await this.db.getRepository(AnnotationEntity).update(id, body as AnnotationEntity);
    this.setStatus(204);
  }

  @Delete("{collectionId}/images/{imageId}/annotations/{id}")
  @Security("auth")
  @Response("204", "No Content")
  @Response("400", "Bad request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not found")
  @Response("500", "Internal Error")
  public async delete(
    @Request() req: ExpressAuthRequest,
    @Path() collectionId: number,
    @Path() imageId: number,
    @Path() id: number,
  ): Promise<void> {
    // Retrieve the image
    const image = await this.getImage(req, collectionId, imageId);

    // Search the annotation
    const annotation = await AnnotationEntity.findOne(id, { relations: ["image"] });
    if (!annotation || annotation.image.id !== image.id) throw Boom.notFound("Annotation not found");

    // Delete
    await annotation.remove();
    this.setStatus(204);
  }

  /**
   * List annotations from a collection.
   */
  @Get("{collectionId}/schema/{schemaId}/annotations")
  @Security("auth")
  @Response("200", "Success")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("500", "Internal Error")
  public async list(
    @Request() req: ExpressAuthRequest,
    @Path() collectionId: number,
    @Path() schemaId: number,
    //@Query() search = "",
    @Query() skip = 0,
    @Query() limit = 100,
  ): Promise<Array<AnnotationModelFull>> {
    // Get the collection
    const collection = await this.getCollection(req, collectionId);
    const annotations = await AnnotationEntity.find({
      relations: ["image", "schema"],
      where: {
        image: In(collection.images_id),
        schema: schemaId,
      },
      skip,
      take: limit,
    });

    return annotations.map((u) => annotationEntityToModelFull(u));
  }
}
