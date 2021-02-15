import { Body, Get, Post, Put, Delete, Route, Response, Query, Path, Security, Request, Tags } from "tsoa";
import { Inject } from "typescript-ioc";
import * as express from "express";
import { getRepository } from "typeorm";
import { plainToClass } from "class-transformer";
import { isEmail, validate } from "class-validator";
import * as Boom from "@hapi/boom";
import { DefaultController } from "./default";
import { getLogger, Logger } from "../services/logger";
import { DbService } from "../services/db";
import { CollectionModel, CollectionEntity } from "../entities/collection";
import { UserModel, UserEntity } from "../entities/user";

@Tags("Collections")
@Route("collections")
export class CollectionsController extends DefaultController {
  // logger
  private log: Logger = getLogger("CollectionsController");
  @Inject
  private db: DbService;

  @Get("")
  @Security("auth")
  @Response("200", "Success")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("500", "Internal Error")
  public async search(
    @Request() req: any,
    @Query() search = "",
    @Query() skip = 0,
    @Query() limit = 0,
  ): Promise<Array<CollectionModel>> {
    const result = await this.db
      .getRepository(CollectionEntity)
      .createQueryBuilder("collection")
      .leftJoinAndSelect("collection.users", "user")
      .where(
        `
        (collection.ownerEmail = :email OR user.email = :email) AND
        (
          to_tsvector('simple', collection.name) @@ to_tsquery('simple', :query) OR
          to_tsvector('simple', collection.description) @@ to_tsquery('simple', :query)
        )
        `,
        { query: search.trim().replace(/ /g, " & "), email: req.user.email },
      )
      .limit(limit)
      .offset(skip)
      .getMany();
    return result;
  }

  @Post()
  @Security("auth")
  @Response("201", "Created")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("500", "Internal Error")
  public async create(@Request() req: any, @Body() body: Omit<CollectionModel, "id">): Promise<CollectionModel> {
    // Validate the body
    const errors = await validate(plainToClass(CollectionEntity, body));
    this.classValidationErrorToHttpError(errors);

    // Save & return the collection
    const collection = await this.db.getRepository(CollectionEntity).save({ ...body, owner: req.user.email });
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
    // Get the collection
    return this.getCollection(req, id);
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
    // Get the collection
    const collection = await this.getCollection(req, id);

    // Validate the body
    const errors = await validate(plainToClass(CollectionEntity, body));
    this.classValidationErrorToHttpError(errors);

    // Update the collection
    await this.db.getRepository(CollectionEntity).save(Object.assign(body, { id }));
    this.setStatus(204);
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
    // Get the collection
    const collection = await this.getCollection(req, id);

    // Delete
    await collection.remove();
    this.setStatus(204);
  }

  @Get("{id}/users")
  @Security("auth")
  @Response("200", "Success")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("500", "Internal Error")
  public async usersSearch(
    @Request() req: any,
    @Path() id: number,
    @Query() search = "",
    @Query() skip = 0,
    @Query() limit = 0,
  ): Promise<Array<UserModel>> {
    const result = await this.db
      .getRepository(UserEntity)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.collections", "collection")
      .where(
        `collection.id = :id AND
         (
           to_tsvector('simple', user.firstname) @@ to_tsquery('simple', :query) OR
           to_tsvector('simple', user.lastname) @@ to_tsquery('simple', :query) OR
           to_tsvector('simple', user.email) @@ to_tsquery('simple', :query) OR
         )
        `,
        { id, query: search.trim().replace(/ /g, " & ") },
      )
      .limit(limit)
      .offset(skip)
      .getMany();
    return result;
  }

  @Put("/{id}/users")
  @Security("auth")
  @Response("204", "No Content")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("500", "Internal Error")
  public async userAdd(@Request() req: any, @Path() id: number, @Body() email: string): Promise<void> {
    // Get the collection
    const collection = await this.getCollection(req, id);

    // Check input
    if (!isEmail(email)) throw Boom.badRequest("Bad email");

    // Do the job
    if (email !== collection.owner.email) {
      const userToAdd = await UserEntity.findOne(email);
      // if the user is not found, we send a 400
      if (!userToAdd) throw Boom.badRequest("Bad email");
      // Add the user to the collection
      collection.users.push(userToAdd);
      await collection.save();
    }
    this.setStatus(204);
  }

  @Delete("/{id}/users")
  @Security("auth")
  @Response("204", "No Content")
  @Response("400", "Bad request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not found")
  @Response("500", "Internal Error")
  public async userDelete(@Request() req: any, @Path() id: number, @Body() email: string): Promise<void> {
    // Check input
    if (!isEmail(email)) throw Boom.badRequest("Bad email");

    // Check if user has access
    const collection = await CollectionEntity.findOne(id, { relations: ["users", "owner"] });
    if (!collection) {
      throw Boom.notFound("Collection not found");
    }
    if (
      collection.owner.email !== req.user.email &&
      collection.users?.findIndex((u) => (u.email = req.user.email)) === -1
    ) {
      throw Boom.forbidden();
    }

    // We can't remove the owner
    if (email === collection.owner.email) throw Boom.badRequest("Can't remove the owner of a collection");
    collection.users = collection.users.filter((u) => u.email !== email);
    await collection.save();
    this.setStatus(204);
  }
}
