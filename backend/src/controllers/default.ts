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

// Custom file type
export type File = {
  originalname: string;
  fieldname: string;
  encoding: string;
  mimetype: string;
  size: string;
  path: string;
};

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
   * Handle files upload.
   */
  protected handleFileUpload(
    request: express.Request,
    fieldsname: Array<string>,
    path_prefix = "",
  ): Promise<Array<File>> {
    const acceptedFields: multer.Field[] = fieldsname.map((name) => ({ name: name, maxCount: 1 }));
    const multerhandler = multer().fields(acceptedFields);
    return new Promise((resolve, reject) => {
      multerhandler(request, undefined, async (error) => {
        if (error) reject(error);
        if (!request.files) reject("Files not present");

        // Iterate over files
        const result = [];
        Object.keys(request.files).forEach((field) => {
          if (request.files[field] && request.files[field][0]) {
            const file = request.files[field][0];
            const dir = path.join(config.upload_path, path_prefix);
            const filePath = path.join(dir, `/${Date.now()}-${file.originalname}`);

            // Create the path if it doesn't exist
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);

            fs.writeFile(filePath, file.buffer, (err) => {
              reject(err);
            });

            result.push({
              originalname: file.originalname,
              fieldname: file.fieldname,
              encoding: file.encoding,
              mimetype: file.mimetype,
              size: file.size,
              path: filePath,
            });
          }
        });
        resolve(result);
      });
    });
  }
}
