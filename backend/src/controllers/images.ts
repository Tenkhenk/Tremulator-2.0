import { Body, Controller, Get, Post, Put, Delete, Route, Response, Request, Query, Path, Security, Tags } from "tsoa";
import { Inject } from "typescript-ioc";
import { DefaultController, ExpressAuthRequest } from "./default";
import { getLogger, Logger } from "../services/logger";
import { DbService } from "../services/db";
import { ImageModel, ImageEntity } from "../entities/image";

@Tags("Collections", "Images")
@Route("collections")
export class ImagesController extends DefaultController {
  // logger
  private log: Logger = getLogger("ImagesController");
  @Inject
  private db: DbService;

  /**
   * Upload and create an image in the collection.
   */
  @Post("{collectionId}/images/upload")
  @Security("auth")
  @Response("201", "Created")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not Found")
  @Response("500", "Internal Error")
  public async upload(@Request() req: ExpressAuthRequest, @Path() collectionId: number): Promise<ImageModel> {
    // Get the collection
    const collection = await this.getCollection(req, collectionId);
    const files = await this.handleFileUpload(req, ["file"], `${collectionId}`);
    if (!files[0]) throw new Error("Failed to save file");
    const file = files[0];

    const image = new ImageEntity();

    return null;
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
    // Get the collection
    const collection = await this.getCollection(req, collectionId);
    return null;
  }

  /**
   * Update an image from the collection.
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
  ): Promise<void> {
    // Get the collection
    const collection = await this.getCollection(req, collectionId);
    return null;
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
    // Get the collection
    const collection = await this.getCollection(req, collectionId);
    return null;
  }
}
