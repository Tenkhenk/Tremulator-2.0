import { Body, Controller, Get, Post, Put, Delete, Route, Response, Request, Query, Path, Security, Tags } from "tsoa";
import { Inject } from "typescript-ioc";
import * as Boom from "@hapi/boom";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import Ajv from "ajv";
import { config } from "../config";
import { DefaultController, ExpressAuthRequest } from "./default";
import { getLogger, Logger } from "../services/logger";
import { DbService } from "../services/db";
import { SchemaModel, SchemaEntity } from "../entities/schema";

@Tags("Schema")
@Route("schema")
export class SchemaController extends DefaultController {
  // logger
  private log: Logger = getLogger("SchemaController");
  @Inject
  private db: DbService;

  /**
   * Create a schema for a collection.
   */
  @Post("{collectionId}/schema")
  @Security("auth")
  @Response("201", "Created")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not Found")
  @Response("500", "Internal Error")
  public async create(
    @Request() req: ExpressAuthRequest,
    @Path() collectionId: number,
    @Body() body: Omit<SchemaModel, "id">,
  ): Promise<SchemaModel> {
    // Get the collection and check rights
    const collection = await this.getCollection(req, collectionId);

    // Validate the body
    try {
      const ajv = new Ajv();
      await ajv.compile(body.schema);
    } catch (e) {
      this.log.error("Schema is invalid", e);
      throw Boom.badRequest("Schema is invalid");
    }
    const errors = await validate(plainToClass(SchemaEntity, body));
    this.classValidationErrorToHttpError(errors);

    // Save & return the collection
    const schema = await this.db.getRepository(SchemaEntity).save(body);
    this.setStatus(201);
    return schema;
  }

  /**
   * Get a schema from the collection.
   */
  @Get("{collectionId}/schema/{id}")
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
    @Path() id: number,
  ): Promise<SchemaModel> {
    // Get the collection
    const collection = await this.getCollection(req, collectionId);

    // Get the schema by its id, and check the collection
    const schema = await this.db.getRepository(SchemaEntity).findOne(id, { relations: ["collection"] });
    if (!schema || schema.collection.id !== collection.id) throw Boom.notFound("Schema not found");

    return schema;
  }

  /**
   * Update a schema from the collection.
   */
  @Put("{collectionId}/schema/{id}")
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
    @Path() id: number,
    @Body() body: Omit<SchemaModel, "id">,
  ): Promise<void> {
    // Get the collection
    const collection = await this.getCollection(req, collectionId);

    // Search the schema
    const schema = await SchemaEntity.findOne(id, { relations: ["collection"] });
    if (!schema || schema.collection.id !== collectionId) throw Boom.notFound("Schema not found");

    // Validate the body
    try {
      const ajv = new Ajv();
      await ajv.compile(body.schema);
    } catch (e) {
      this.log.error("Schema is invalid", e);
      throw Boom.badRequest("Schema is invalid");
    }
    const errors = await validate(plainToClass(SchemaEntity, body));
    this.classValidationErrorToHttpError(errors);

    // Save the schema
    await this.db.getRepository(SchemaEntity).update(schema.id, body);
    this.setStatus(204);
  }

  /**
   * Delete an schema from the collection and its related annotations.
   */
  @Delete("{collectionId}/schema/{id}")
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
    @Path() id: number,
  ): Promise<void> {
    // Get the collection
    const collection = await this.getCollection(req, collectionId);

    // Search the schema
    const schema = await SchemaEntity.findOne(id, { relations: ["collection"] });
    if (!schema || schema.collection.id !== collectionId) throw Boom.notFound("Schema not found");

    // Delete
    await schema.remove();
    this.setStatus(204);
  }
}
