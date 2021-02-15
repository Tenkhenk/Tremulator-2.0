import { Body, Controller, Get, Post, Put, Delete, Route, Response, Query, Path, Security, Request, Tags } from "tsoa";
import { Inject } from "typescript-ioc";
import * as express from "express";
import { getRepository } from "typeorm";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import * as Boom from "@hapi/boom";
import { getLogger, Logger } from "../services/logger";
import { DbService } from "../services/db";
import { CollectionModel, CollectionEntity } from "../entities/collection";

@Tags("Collections")
@Route("collections")
export class CollectionsController extends Controller {
  // logger
  private log: Logger = getLogger("CollectionsController");
  @Inject
  private db: DbService;

  @Get("")
  @Security("auth")
  @Response("200", "Success")
  @Response("400", "Bad Request")
  @Response("500", "Internal Error")
  public async search(
    @Request() req: any,
    @Query() search = "",
    @Query() skip = 0,
    @Query() limit = 0,
  ): Promise<CollectionModel> {
    return null;
  }

  @Post()
  @Security("auth")
  @Response("201", "Created")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not Found")
  @Response("500", "Internal Error")
  @Response("500", "Internal Error")
  public async create(@Request() req: any, @Body() body: Omit<CollectionModel, "id">): Promise<CollectionModel> {
    // Validate the body
    const errors = await validate(plainToClass(CollectionEntity, body));
    //TODO: better error message
    if (errors.length > 0) {
      throw Boom.badRequest("Validation failed");
    }

    const collection = await this.db.getRepository(CollectionEntity).save(body);
    this.setStatus(201);
    return collection;
  }

  @Get("{id}")
  @Security("auth")
  @Response("200", "Success")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not Found")
  @Response("500", "Internal Error")
  public async get(@Request() req: any, @Path() id: number): Promise<CollectionModel> {
    console.log("user", req.user);
    const collection = await this.db.getRepository(CollectionEntity).findOne({ id });
    if (!collection) {
      throw Boom.notFound("Collection not found");
    }
    return collection;
  }

  @Put("{id}")
  @Security("auth")
  @Response("204", "No Content")
  @Response("400", "Bad request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not found")
  @Response("500", "Internal Error")
  public async update(@Request() req: any, @Path() id: number, @Body() body: CollectionModel): Promise<void> {
    const collection = await this.db.getRepository(CollectionEntity).findOne({ id });
    if (!collection) {
      throw Boom.notFound("Collection not found");
    }
    // Validate the body
    const errors = await validate(plainToClass(CollectionEntity, body));
    if (errors.length > 0) {
      throw Boom.badRequest("Validation failed");
    }
    await this.db.getRepository(CollectionEntity).save(Object.assign({ id }, body));
    this.setStatus(204);
    return null;
  }

  @Delete("{id}")
  @Security("auth")
  @Response("204", "No Content")
  @Response("400", "Bad request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not found")
  @Response("500", "Internal Error")
  public async delete(@Request() req: any, @Path() id: number): Promise<void> {
    const collection = await this.db.getRepository(CollectionEntity).findOne({ id });
    if (!collection) {
      throw Boom.notFound("Collection not found");
    }
    await this.db.getRepository(CollectionEntity).delete({ id });
    return null;
  }
}
