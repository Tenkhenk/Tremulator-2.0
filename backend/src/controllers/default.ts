import { Controller } from "tsoa";
import { CollectionEntity } from "../entities/collection";
import * as Boom from "@hapi/boom";
import { ValidationError } from "class-validator";

export class DefaultController extends Controller {
  /**
   * Retrieve the collection and check if the user has acces to it.
   * @param req the express request with the user in it.
   * @param id The id of the collection
   * @throw  A 404 if the collection is not found, or a 403 if the user is not allowed
   * @returns {CollectionEntity}
   */
  protected async getCollection(req: any, id: number): Promise<CollectionEntity> {
    // Search the collection in DB
    const collection = await CollectionEntity.findOne(id, { relations: ["users", "owner"] });

    // if nothing is found => 404
    if (!collection) throw Boom.notFound("Collection not found");

    // Check if user has access, ie. is the owner or in the userlist
    // if not => Forbidden
    if (
      collection.owner.email !== req.user.email &&
      collection.users?.findIndex((u) => u.email === req.user.email) === -1
    ) {
      throw Boom.forbidden();
    }

    return collection;
  }

  /**
   * Throw a well formatted "bad request" if there is errors.
   */
  protected classValidationErrorToHttpError(errors: Array<ValidationError>): void {
    if (errors && errors.length > 0) {
      throw Boom.badRequest(`Validation failed for field(s) ${errors.map((e) => e.property).join(",")}`);
    }
  }
}
