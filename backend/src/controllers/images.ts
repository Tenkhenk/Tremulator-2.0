import { Body, Controller, Get, Post, Put, Delete, Route, Response, Query, Path, Security, Tags } from "tsoa";
import { Inject } from "typescript-ioc";
import { getLogger, Logger } from "../services/logger";
import { DbService } from "../services/db";
import { ImageModel } from "../entities/image";

@Tags("Images")
@Route("images")
export class ImagesController extends Controller {
  // logger
  private log: Logger = getLogger("ImagesController");
  @Inject
  private db: DbService;

  @Post()
  @Security("auth")
  @Response("201", "Created")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not Found")
  @Response("500", "Internal Error")
  @Response("500", "Internal Error")
  public async create(): Promise<ImageModel> {
    return null;
  }

  @Get("{id}")
  @Security("auth")
  @Response("200", "Success")
  @Response("400", "Bad Request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not Found")
  @Response("500", "Internal Error")
  public async get(@Path() id: number): Promise<ImageModel> {
    return null;
  }

  @Put("{id}")
  @Security("auth")
  @Response("204", "No Content")
  @Response("400", "Bad request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not found")
  @Response("500", "Internal Error")
  public async update(@Path() id: number): Promise<void> {
    return null;
  }

  @Delete("{id}")
  @Security("auth")
  @Response("204", "No Content")
  @Response("400", "Bad request")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("404", "Not found")
  @Response("500", "Internal Error")
  public async delete(): Promise<void> {
    return null;
  }
}
