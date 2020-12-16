import { Controller, Get, Route, Security, Tags } from "tsoa";
import { getLogger, Logger } from "../services/logger.service";

@Tags("Miscellaneous")
@Route("misc")
export class MiscellaneousController extends Controller {
  // logger
  private log: Logger = getLogger("MiscellaneousController");

  @Get("ping")
  public async ping(): Promise<string> {
    return "pong";
  }
}
