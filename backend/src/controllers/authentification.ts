import { Body, Controller, Get, Post, Request, Response, Route, Security, Tags } from "tsoa";
import { Inject } from "typescript-ioc";
import * as Boom from "@hapi/boom";
import * as express from "express";
import { getLogger, Logger } from "../services/logger";
import { DbService } from "../services/db";
import { AuthService, ValidateCodeRequest, ValidateCodeResponse } from "../services/authentification";
import { UserEntity, UserModel } from "../entities/user";

/**
 * Endpoint used in the OpenId code flow to validate the receive Authorization code
 * from the identity provider.
 * We add the client_secret in the body, so it's not stored on the clietn side.
 * Store the access token and the token id, for the auth mecanism of the API.
 */
@Tags("Authentification")
@Route("auth")
export class AuthController extends Controller {
  // logger
  private log: Logger = getLogger("AuthController");
  @Inject
  private auth: AuthService;
  @Inject
  private db: DbService;

  @Post("validate_code")
  @Response("500", "Internal Error")
  public async validate_code(@Body() body: ValidateCodeRequest): Promise<ValidateCodeResponse> {
    // Checks
    if (!body.client_id) throw Boom.badRequest("Parameter `client_id` is mandatory and should not be null or empty");
    if (!body.code) throw Boom.badRequest("Parameter `code` is mandatory and should not be null or empty");
    if (!body.code_verifier)
      throw Boom.badRequest("Parameter `code_verifier` is mandatory and should not be null or empty");
    if (!body.grant_type) throw Boom.badRequest("Parameter `grant_type` is mandatory and should not be null or empty");
    if (!body.redirect_uri)
      throw Boom.badRequest("Parameter `redirect_uri` is mandatory and should not be null or empty");

    // Do the work
    const result = await this.auth.validate_code(body);

    return result;
  }

  @Get("whoami")
  @Security("auth")
  @Response("401", "Unauthorized")
  @Response("403", "Forbidden")
  @Response("500", "Internal Error")
  public async whoami(@Request() req: express.Request): Promise<UserModel> {
    // get the user
    const user: UserEntity = await this.auth.verify(req);
    this.log.debug(`User is `, user);
    return user;
  }
}
