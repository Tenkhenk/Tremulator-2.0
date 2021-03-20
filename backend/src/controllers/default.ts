import { Controller } from "tsoa";
import * as express from "express";
import * as multer from "multer";
import * as Boom from "@hapi/boom";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { ValidationError } from "class-validator";
import { UserEntity } from "../entities/user";
import { CollectionEntity } from "../entities/collection";
import { ImageEntity } from "../entities/image";
import { getLogger, Logger } from "../services/logger";
import { config } from "../config";

// Express request with user
export type ExpressAuthRequest = express.Request & { user: UserEntity };

// Custom file type
export type File = {
  originalname: string;
  fieldname?: string;
  mimetype: string;
  path: string;
};

const log: Logger = getLogger("DefaultController");

export class DefaultController extends Controller {
  /**
   * Retrieve the collection and check if the user has acces to it.
   *
   * @param req the express request with the user in it.
   * @param id The id of the collection
   * @throw  A 404 if the collection is not found, or a 403 if the user is not allowed
   * @returns {CollectionEntity}
   */
  protected async getCollection(
    req: ExpressAuthRequest,
    id: number,
    relations = ["users", "owner"],
  ): Promise<CollectionEntity> {
    // Search the collection in DB
    const collection = await CollectionEntity.findOne(id, { relations });

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
   * Retrieve the image and check if the user has acces to it.
   *
   * @param req the express request with the user in it.
   * @param collectionId The id of thecollection
   * @param id The id of the image
   * @throw  A 404 if the collection is not found, or a 403 if the user is not allowed
   * @returns {ImageEntity}
   */
  protected async getImage(
    req: ExpressAuthRequest,
    collectionId: number,
    id: number,
    relations = ["collection"],
  ): Promise<ImageEntity> {
    // Search the collection in DB
    const collection = await this.getCollection(req, collectionId);

    // Retrieve the image
    const image = await ImageEntity.findOne(id, { relations });

    // Check
    if (!image || image.collection.id !== collectionId) throw Boom.notFound("Image not found");

    return image;
  }

  /**
   * Throw a well formatted "bad request" if there is errors.
   */
  protected classValidationErrorToHttpError(errors: Array<ValidationError>): void {
    if (errors && errors.length > 0) {
      log.error("Validation failed", errors);
      throw Boom.badRequest(`Validation failed for field(s) ${errors.map((e) => e.property).join(",")}`);
    }
  }

  /**
   * Handle files upload (via multiple fields).
   *
   * @param request The express request
   * @param fieldsname List of file field
   * @param path_prefix Additional path where to download the file inside the upload folder (default: "").
   */
  protected handleFilesUpload(
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
        const result = await Promise.all(
          Object.keys(request.files).map(async (field) => {
            const file = request.files[field][0];
            const savedFile = await this.saveFile(path_prefix, file.originalname, file.mimetype, file.buffer);
            return { ...savedFile, fieldname: field };
          }),
        );
        resolve(result);
      });
    });
  }

  /**
   * Handle multiple file upload (via an array of file).
   *
   * @param request The express request
   * @param fieldname Name of the field that contains an array of file
   * @param path_prefix Additional path where to download the file inside the upload folder (default: "").
   */
  protected handleArrayFileUpload(request: express.Request, fieldname: string, path_prefix = ""): Promise<Array<File>> {
    const multerhandler = multer().array(fieldname);
    return new Promise((resolve, reject) => {
      multerhandler(request, undefined, async (error) => {
        if (error) reject(error);
        if (!request.files) reject("Files not present");

        // Iterate over files
        const result = await Promise.all(
          (request.files as Array<any>).map((file) => {
            return this.saveFile(path_prefix, file.originalname, file.mimetype, file.buffer);
          }),
        );
        resolve(result);
      });
    });
  }

  /**
   * Handle files download.
   * @param fileUrl Url of the file to download
   * @param path_prefix Additional path where to download the file inside the upload folder (default: "").
   */
  protected async handleFileDownload(fileUrl: string, path_prefix = ""): Promise<File> {
    const response = await axios({
      method: "GET",
      url: fileUrl,
      responseType: "arraybuffer",
    });

    // Check if content type is allowed
    if (!config.data.mime_types.includes(response.headers["content-type"])) throw Boom.unsupportedMediaType();

    // Get file name
    let filename = path.basename(url.parse(fileUrl).path);
    const contentDisposition = response.headers["content-disposition"];
    if (contentDisposition && /^attachment/i.test(contentDisposition)) {
      filename = contentDisposition.toLowerCase().split("filename=")[1].split(";")[0].replace(/"/g, "");
    }

    return await this.saveFile(path_prefix, filename, response.headers["content-type"], response.data);
  }

  private async saveFile(path_prefix: string, filename: string, mimetype: string, data: Buffer): Promise<File> {
    return new Promise((resolve, reject) => {
      const dir = path.join(config.data.path, path_prefix);
      // Create the path if it doesn't exist
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);

      // Check if content type is allowed
      if (!config.data.mime_types.includes(mimetype.toLowerCase())) throw Boom.unsupportedMediaType();

      // Build file path
      const filePath = path.join(dir, `/${uuid()}.${mimetype.toLowerCase().split("/").pop()}`);

      // Save the file
      fs.writeFile(filePath, data, (err) => {
        if (err) reject(err);
        resolve({
          originalname: this.cleanFilename(filename),
          mimetype: mimetype,
          path: filePath,
        });
      });
    });
  }

  private cleanFilename(filename: string): string {
    return filename.split(".").slice(0, -1).join(".");
  }
}
