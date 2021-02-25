import { Body, Controller, Get, Post, Put, Request, Response, Route, Security, Tags } from "tsoa";
import { Inject } from "typescript-ioc";
import * as Boom from "@hapi/boom";
import { ExpressAuthRequest } from "./default";
import { MailService } from "../services/mail";
import { getLogger, Logger } from "../services/logger";
import { UserEntity } from "../entities/user";
import { config } from "../config";

@Tags("Miscellaneous")
@Route("misc")
export class MiscellaneousController extends Controller {
  // logger
  private log: Logger = getLogger("MiscellaneousController");

  @Inject
  private mail: MailService;

  @Get("ping")
  public async ping(): Promise<string> {
    return "pong";
  }

  @Post("echo")
  public async echo(@Body() body: unknown): Promise<unknown> {
    return body;
  }

  @Put("lock_user")
  @Security("auth")
  @Response("204", "No Content")
  @Response("400", "Bad request")
  @Response("401", "Unauthorized")
  public async lock_user(
    @Request() req: ExpressAuthRequest,
    @Body() body: { email: string; lock?: boolean },
  ): Promise<void> {
    // Check if user is admin
    const user = await UserEntity.findOne(req.user.email);
    if (!user.is_admin === true) throw Boom.unauthorized();

    // Search the user to lock/unlock
    const targetUser = await UserEntity.findOne(body.email);
    if (!targetUser) throw Boom.notFound();

    // lock/unlock the user
    targetUser.is_lock = body.lock || true;
    targetUser.save();

    // send an email
    this.mail.send(
      config.noreply_address,
      config.noreply_address,
      [targetUser.email],
      `[tremulator] Your account has been ${targetUser.is_lock ? "locked" : "unlocked"}`,
      `Hi ${targetUser.firstname},
       I inform that your account on tremulator has been ${targetUser.is_lock ? "locked" : "unlocked"}.
       Cheers.`,
    );
    this.setStatus(204);
  }
}
