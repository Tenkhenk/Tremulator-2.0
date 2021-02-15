import { Controller } from "tsoa";
import * as express from "express";
import * as multer from "multer";
import * as Boom from "@hapi/boom";
import * as fs from "fs";
import * as path from "path";
import { ValidationError } from "class-validator";
import { CollectionEntity } from "../entities/collection";
import { UserEntity } from "../entities/user";
import { getLogger, Logger } from "../services/logger";
import { config } from "../config";

// Express request with user
export type ExpressAuthRequest = express.Request & { user: UserEntity };

const log: Logger = getLogger("DefaultController");

export class DefaultController extends Controller {
  /**
   * Retrieve the collection and check if the user has acces to it.
   * @param req the express request with the user in it.
   * @param id The id of the collection
   * @throw  A 404 if the collection is not found, or a 403 if the user is not allowed
   * @returns {CollectionEntity}
   */
  protected async getCollection(req: ExpressAuthRequest, id: number): Promise<CollectionEntity> {
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

  /**
   * Handle a file upload.
   */
  protected handleFileUpload(request: express.Request, fieldname: string): Promise<void> {
    const multerSingle = multer().single(fieldname);
    return new Promise((resolve, reject) => {
      multerSingle(request, undefined, async (error) => {
        if (error) reject(error);
        if (!request.file) reject("File not present");
        console.log(request.file);
        fs.writeFileSync(path.join(config.upload_path, request.file.originalname), request.file.buffer);
        resolve();
      });
    });
  }
}
