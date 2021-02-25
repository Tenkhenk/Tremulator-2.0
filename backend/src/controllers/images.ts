import { Body, Controller, Get, Post, Put, Delete, Route, Response, Request, Query, Path, Security, Tags } from "tsoa";
import { Inject } from "typescript-ioc";
import * as fs from "fs";
import * as Boom from "@hapi/boom";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { config } from "../config";
import { DefaultController, ExpressAuthRequest } from "./default";
import { getLogger, Logger } from "../services/logger";
import { DbService } from "../services/db";
import { imageEntityToModel, imageEntityToModelFull, ImageModel, ImageModelFull, ImageEntity } from "../entities/image";

@Tags("Images")
@Route("collections")
export class ImagesController extends DefaultController {
  // logger
  private log: Logger = getLogger("ImagesController");
  @Inject
  private db: DbService;

  /**
   * Create images in the collection by uploading a files (via an array of files).
   */
  @Post("{collectionId}/images/upload")
  @Security("auth")
  @Response("201", "Created")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not Found")
  @Response("500", "Internal Error")
  public async upload(@Request() req: ExpressAuthRequest, @Path() collectionId: number): Promise<Array<ImageModel>> {
    // Get the collection
    const collection = await this.getCollection(req, collectionId);

    // Handle the uploaded files
    const files = await this.handleArrayFileUpload(req, "files", `${collectionId}`);

    const result = await Promise.all(
      files.map(async (file) => {
        // Save the image
        const image = new ImageEntity();
        image.name = file.originalname;
        image.url = `/iiif/2/${file.path.replace(config.data.path + "/", "").replace(/\//, "%2F")}/info.json`;
        image.path = file.path;
        image.collection = collection;
        await image.save();

        return image;
      }),
    );

    this.setStatus(201);
    return result.map((i) => imageEntityToModel(i));
  }

  /**
   * Create images in the collection by specifying a list of url to download.
   */
  @Post("{collectionId}/images/download")
  @Security("auth")
  @Response("201", "Created")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not Found")
  @Response("500", "Internal Error")
  public async download(
    @Request() req: ExpressAuthRequest,
    @Path() collectionId: number,
    @Body() body: { urls: Array<string> },
  ): Promise<Array<ImageModel>> {
    // Get the collection
    const collection = await this.getCollection(req, collectionId);

    if (!body || !body.urls || !Array.isArray(body.urls)) throw Boom.badRequest("Bad value for urls");

    const result = await Promise.all(
      body.urls.map(async (url) => {
        // Handle the uploaded file
        const file = await this.handleFileDownload(url, `${collectionId}`);

        // Save the image
        const image = new ImageEntity();
        image.name = file.originalname;
        image.url = `/iiif/2/${file.path.replace(config.data.path + "/", "").replace(/\//, "%2F")}/info.json`;
        image.path = file.path;
        image.collection = collection;
        await image.save();

        return image;
      }),
    );

    this.setStatus(201);
    return result.map((i) => imageEntityToModel(i));
  }

  /**
   * Get an image from the collection.
   */
  @Get("{collectionId}/images/{id}")
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
  ): Promise<ImageModel> {
    // Retrieve the image
    const image = await this.getImage(req, collectionId, id, ["collection", "annotations"]);
    return imageEntityToModelFull(image);
  }

  /**
   * Update an image from the collection (just the metadata).
   */
  @Put("{collectionId}/images/{id}")
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
    @Body() body: ImageModel,
  ): Promise<void> {
    // Retrieve the image
    const image = await this.getImage(req, collectionId, id);

    // Validate the body
    const errors = await validate(plainToClass(ImageEntity, body));
    this.classValidationErrorToHttpError(errors);

    // Update the image
    await this.db.getRepository(ImageEntity).update(id, body);
    this.setStatus(204);
  }

  /**
   * Delete an image from the collection.
   */
  @Delete("{collectionId}/images/{id}")
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
    fs.unlinkSync(image.path);
    this.setStatus(204);
  }
}
