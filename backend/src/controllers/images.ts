import { Body, Controller, Get, Post, Put, Delete, Route, Response, Request, Query, Path, Security, Tags } from "tsoa";
import { Inject } from "typescript-ioc";
import * as Boom from "@hapi/boom";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { MoreThan, LessThan } from "typeorm";
import { config } from "../config";
import { DefaultController, ExpressAuthRequest } from "./default";
import { getLogger, Logger } from "../services/logger";
import { DbService } from "../services/db";
import {
  imageEntityToModel,
  imageEntityToModelFull,
  ImageData,
  ImageModel,
  ImageModelFull,
  ImageEntity,
} from "../entities/image";

@Tags("Images")
@Route("collections")
export class ImagesController extends DefaultController {
  // logger
  private log: Logger = getLogger("ImagesController");
  @Inject
  private db: DbService;

  /**
   * Update the images order on the collection.
   * You should send an array of image's id in the good order.
   */
  @Put("{collectionId}/images/order")
  @Security("auth")
  @Response("204", "No Content")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not Found")
  @Response("500", "Internal Error")
  public async imagesOrder(
    @Request() req: ExpressAuthRequest,
    @Path() collectionId: number,
    @Body() body: { order: Array<number> },
  ): Promise<void> {
    // Get the collection
    const collection = await this.getCollection(req, collectionId, ["users", "owner", "images"]);

    // Check if we have all the image of the collection
    if (body.order.length !== collection.images.length)
      throw Boom.badRequest("Incomplete order list, some images are missing");

    // Check if all image are part of the collection
    body.order.forEach((id) => {
      if (collection.images.findIndex((image) => image.id === id) < 0)
        throw Boom.badRequest(`Image ${id} doesn't exist in the collection ${collectionId}`);
    });

    // Update the order for each image
    const queryRunner = this.db.connection.createQueryRunner();
    // establish real database connection using our new query runner
    await queryRunner.connect();
    // lets now open a new transaction:
    await queryRunner.startTransaction();
    try {
      await Promise.all(
        collection.images.map(async (image) => {
          image.order = body.order.findIndex((id) => id === image.id);
          await queryRunner.manager.save(image);
        }),
      );
      // commit transaction now:
      await queryRunner.commitTransaction();
    } catch (err) {
      // since we have errors let's rollback changes we made
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // you need to release query runner which is manually created:
      await queryRunner.release();
    }

    this.setStatus(204);
  }

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
      files.map(async (file, index) => {
        // Save the image
        const image = new ImageEntity();
        image.name = file.originalname;
        image.url = `/iiif/2/${file.path.replace(config.data.path + "/", "").replace(/\//, "%2F")}/info.json`;
        image.path = file.path;
        image.order = collection.images_id.length + 1 + index;
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
      body.urls.map(async (url, index) => {
        // Handle the uploaded file
        const file = await this.handleFileDownload(url, `${collectionId}`);

        // Save the image
        const image = new ImageEntity();
        image.name = file.originalname;
        image.url = `/iiif/2/${file.path.replace(config.data.path + "/", "").replace(/\//, "%2F")}/info.json`;
        image.path = file.path;
        image.collection = collection;
        image.order = collection.images_id.length + 1 + index;
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
  ): Promise<ImageModelFull> {
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
    @Body() body: ImageData,
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
    this.setStatus(204);
  }
}
