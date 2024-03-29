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
import {
  collectionEntityToModel,
  collectionEntityToModelFull,
  CollectionModel,
  CollectionData,
  CollectionModelFull,
  CollectionEntity,
} from "../entities/collection";
import { userEntityToModel, UserModel, UserEntity } from "../entities/user";

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
  @Get()
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
      .leftJoinAndSelect("collection.owner", "owner")
      .leftJoinAndSelect("collection.users", "user")
      .where(
        `
        (collection.ownerEmail = :email OR user.email = :email)
        ${
          search.trim() !== ""
            ? `AND
        (
          to_tsvector('simple', collection.name) @@ to_tsquery('simple', :query) OR
          to_tsvector('simple', collection.description) @@ to_tsquery('simple', :query)
        )`
            : ""
        }
        `,
        { query: search.trim().replace(/ /g, " & "), email: req.user.email },
      )
      .limit(limit)
      .offset(skip)
      .getMany();

    return result.map((c) => collectionEntityToModel(c));
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
  public async create(@Request() req: ExpressAuthRequest, @Body() body: CollectionData): Promise<CollectionModel> {
    // Validate the body
    const errors = await validate(plainToClass(CollectionEntity, body));
    this.classValidationErrorToHttpError(errors);

    // Find the user
    const current = await UserEntity.findOne(req.user.email);

    // Save & return the collection
    const collection = await this.db.getRepository(CollectionEntity).save({ ...body, owner: current });
    this.setStatus(201);
    return collectionEntityToModel(collection);
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
  public async get(
    @Request() req: ExpressAuthRequest,
    @Path() id: number,
    @Query() sortField: string = "order",
    @Query() sortOrder: string = "ASC",
  ): Promise<CollectionModelFull> {
    // Get the collection and check rights
    const collection = await this.getCollection(req, id, ["users", "owner", "schemas", "images"]);
    const result = collectionEntityToModelFull(collection, sortField);

    if (sortOrder.toLowerCase() === "desc") {
      result.images = result.images.reverse();
    }

    return result;
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
    @Body() body: CollectionData,
  ): Promise<void> {
    // Get the collection
    const collection = await this.getCollection(req, id);

    // Validate the body
    const errors = await validate(plainToClass(CollectionEntity, body));
    this.classValidationErrorToHttpError(errors);

    // Update the collection
    await this.db.getRepository(CollectionEntity).update(id, body);
    this.setStatus(204);
  }

  /**
   * Delete a collection.
   * Only the owner of a collection can delete it.
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

    // check if the current user is the owner
    if (collection.owner.email !== req.user.email) throw Boom.forbidden("Only available for collection's owner");

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
    @Query() limit = 10,
  ): Promise<Array<UserModel>> {
    // Get the collection
    const collection = await this.getCollection(req, id);

    // check if the current user is the owner
    if (collection.owner.email !== req.user.email) throw Boom.forbidden("Only available for collection's owner");

    const result = await this.db
      .getRepository(UserEntity)
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.collections", "collection")
      .where(
        `collection.id = :id
         ${
           search.trim() !== ""
             ? ` AND (
           to_tsvector('simple', "user"."firstname") @@ to_tsquery('simple', :query ) OR
           to_tsvector('simple', "user"."lastname") @@ to_tsquery('simple', :query ) OR
           to_tsvector('simple', "user"."email") @@ to_tsquery('simple', :query )
         )`
             : ""
         }

        `,
        { id, query: search.trim().replace(/ /g, " & ") },
      )
      .limit(limit)
      .offset(skip)
      .getMany();
    return result.map((u) => userEntityToModel(u));
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
  public async userAdd(
    @Request() req: ExpressAuthRequest,
    @Path() id: number,
    @Body() body: { email: string },
  ): Promise<void> {
    // Get the collection
    const collection = await this.getCollection(req, id);

    // check if the current user is the owner
    if (collection.owner.email !== req.user.email) throw Boom.forbidden("Only available for collection's owner");

    // Check input
    if (!isEmail(body.email)) throw Boom.badRequest("Bad email");

    // TODO: What to do if user is not found ? send an email ?

    // Do the job
    if (body.email !== collection.owner.email) {
      const userToAdd = await UserEntity.findOne(body.email);

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
    @Body() body: { email: string },
  ): Promise<void> {
    // Get the collection
    const collection = await this.getCollection(req, id);

    // check if the current user is the owner
    if (collection.owner.email !== req.user.email) throw Boom.forbidden("Only available for collection's owner");

    // Check input
    if (!isEmail(body.email)) throw Boom.badRequest("Bad email");

    // We can't remove the owner
    if (body.email === collection.owner.email) throw Boom.badRequest("Can't remove the owner of a collection");
    collection.users = collection.users.filter((u) => u.email !== body.email);
    await collection.save();
    this.setStatus(204);
  }
}
