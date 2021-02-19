import { Body, Controller, Get, Post, Put, Delete, Route, Response, Request, Query, Path, Security, Tags } from "tsoa";
import { Inject } from "typescript-ioc";
import * as Boom from "@hapi/boom";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { config } from "../config";
import { DefaultController, ExpressAuthRequest } from "./default";
import { getLogger, Logger } from "../services/logger";
import { DbService } from "../services/db";
import { SchemaModel, SchemaEntity } from "../entities/schema";

@Tags("Images")
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
  public async create(@Request() req: ExpressAuthRequest, @Path() collectionId: number): Promise<SchemaModel> {
    // Get the collection
    const collection = await this.getCollection(req, collectionId);

    return null;
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
    return null;
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
    return null;
  }

  /**
   * Delete an schema from the collection.
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
    // Retrieve the image
    const image = await this.getImage(req, collectionId, id);

    // Delete
    await image.remove();
    this.setStatus(204);
  }
}
