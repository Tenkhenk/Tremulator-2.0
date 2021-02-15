import { Body, Get, Post, Put, Delete, Route, Response, Query, Path, Security, Request, Tags } from "tsoa";
import { Inject } from "typescript-ioc";
import * as express from "express";
import { getRepository } from "typeorm";
import { plainToClass } from "class-transformer";
import { isEmail, validate } from "class-validator";
import * as Boom from "@hapi/boom";
import { DefaultController, ExpressAuthRequest } from "./default";
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

  /**
   * Make a search in the collections.
   */
  @Get("")
  @Security("auth")
  @Response("200", "Success")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("500", "Internal Error")
  public async search(
    @Request() req: ExpressAuthRequest,
    @Query() search = "",
    @Query() skip = 0,
    @Query() limit = 10,
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

  /**
   * Creates a new collection.
   */
  @Post()
  @Security("auth")
  @Response("201", "Created")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("500", "Internal Error")
  public async create(
    @Request() req: ExpressAuthRequest,
    @Body() body: Omit<CollectionModel, "id">,
  ): Promise<CollectionModel> {
    // Validate the body
    const errors = await validate(plainToClass(CollectionEntity, body));
    this.classValidationErrorToHttpError(errors);

    // Find the user
    const current = await UserEntity.findOne(req.user.email);
    // Save & return the collection
    const collection = await this.db.getRepository(CollectionEntity).save({ ...body, owner: current });
    this.setStatus(201);
    return collection;
  }

  /**
   * Retrieves a collection by its ID.
   */
  @Get("{id}")
  @Security("auth")
  @Response("200", "Success")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not Found")
  @Response("500", "Internal Error")
  public async get(@Request() req: ExpressAuthRequest, @Path() id: number): Promise<CollectionModel> {
    // Get the collection
    return this.getCollection(req, id);
  }

  /**
   * Update a collection
   */
  @Put("{id}")
  @Security("auth")
  @Response("204", "No Content")
  @Response("400", "Bad request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not found")
  @Response("500", "Internal Error")
  public async update(
    @Request() req: ExpressAuthRequest,
    @Path() id: number,
    @Body() body: CollectionModel,
  ): Promise<void> {
    // Get the collection
    const collection = await this.getCollection(req, id);

    // Validate the body
    const errors = await validate(plainToClass(CollectionEntity, body));
    this.classValidationErrorToHttpError(errors);

    // Update the collection
    await this.db.getRepository(CollectionEntity).save(Object.assign(body, { id }));
    this.setStatus(204);
  }

  /**
   * Delete a collection
   */
  @Delete("{id}")
  @Security("auth")
  @Response("204", "No Content")
  @Response("400", "Bad request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not found")
  @Response("500", "Internal Error")
  public async delete(@Request() req: ExpressAuthRequest, @Path() id: number): Promise<void> {
    // Get the collection
    const collection = await this.getCollection(req, id);

    // Delete
    await collection.remove();
    this.setStatus(204);
  }

  /**
   * Search users (in firstanme, lastname and email) that have access to the collection.
   */
  @Get("{id}/users")
  @Security("auth")
  @Response("200", "Success")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("500", "Internal Error")
  public async usersSearch(
    @Request() req: ExpressAuthRequest,
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

  /**
   * Add a user (via its email) to the collection.
   * The email must match a valid a user, otherwise a 400 is returned.
   */
  @Put("/{id}/users")
  @Security("auth")
  @Response("204", "No Content")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("500", "Internal Error")
  public async userAdd(@Request() req: ExpressAuthRequest, @Path() id: number, @Body() email: string): Promise<void> {
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

  /**
   * Remove a user (via its email) from the collection.
   *If the email is the one of the collection's owner, a 403 is returned.
   */
  @Delete("/{id}/users")
  @Security("auth")
  @Response("204", "No Content")
  @Response("400", "Bad request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not found")
  @Response("500", "Internal Error")
  public async userDelete(
    @Request() req: ExpressAuthRequest,
    @Path() id: number,
    @Body() email: string,
  ): Promise<void> {
    // Get the collection
    const collection = await this.getCollection(req, id);

    // Check input
    if (!isEmail(email)) throw Boom.badRequest("Bad email");

    // We can't remove the owner
    if (email === collection.owner.email) throw Boom.badRequest("Can't remove the owner of a collection");
    collection.users = collection.users.filter((u) => u.email !== email);
    await collection.save();
    this.setStatus(204);
  }
}
