import { Inject, Factory, Singleton } from "typescript-ioc";
import * as express from "express";
import * as Boom from "@hapi/boom";
import axios from "axios";
import { config } from "../config";
import { User, ValidateCodeRequest, ValidateCodeResponse } from "../types/authentification";
import { CacheService } from "./cache";
import { JwtService } from "./jwt";
import { getLogger, Logger } from "./logger";

/* eslint-disable @typescript-eslint/no-use-before-define */
@Singleton
export class AuthService {
  // logger
  private log: Logger = getLogger("AuthService");
  @Inject
  private cache: CacheService;
  @Inject
  private jwt: JwtService;

  /**
   * Validate a token receive from the SPA to the IDP.
   */
  async validate_code(body: ValidateCodeRequest): Promise<ValidateCodeResponse> {
    // Make the call and parse it
    let data = body;
    if (config.auth.client_secret) {
      data = Object.assign({}, body, { client_secret: config.auth.client_secret });
    }
    this.log.info(`Trying to validate the code with the provider`);
    const response = await axios({
      method: "POST",
      url:
        config.auth.authority_token_endpoint +
        "?grant_type=" +
        data["grant_type"] +
        "&redirect_uri=" +
        data["redirect_uri"] +
        "&code=" +
        data["code"] +
        "&code_verifier=" +
        data["code_verifier"],
      headers: {
        Authorization: "Basic " + new Buffer(data["client_id"] + ":" + data["client_secret"]).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      responseType: "json",
    });

    const result: ValidateCodeResponse = response.data;

    // verify the id_token
    await this.jwt.verify(result.id_token);

    // Retrieve user info
    const profileResponse = await axios({
      method: "POST",
      url: config.auth.userinfo_endpoint,
      headers: {
        Authorization: "Bearer " + result.access_token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      responseType: "json",
    });
    const profile: User = profileResponse.data;
    profile.email = profile.email || profile.mail;
    this.log.info(`User profile is `, profile);

    // save in the cache
    this.cache.set<User>(result.access_token, profile, result.expires_in);
    return result;
  }

  /**
   * Verifiy if the access token is present in the request and search it in the cache.
   * if it's not found, throw an exception (badRequest or Unauthorized).
   * Otherwise, it returns the user 's profile.
   */
  verify(request: express.Request): Promise<User> {
    return new Promise((resolve, reject) => {
      let token: string;

      // test if bearer token is in query parameter
      if (request.query && request.query["access_token"]) {
        this.log.info(`Found token in query parameters`);
        token = request.query["access_token"] as string;
      }

      // test bearer token in the body as "access_token"
      if (request.body && request.body["access_token"]) {
        this.log.info(`Found token in body`);
        if (token) throw Boom.badRequest("Bearer token can only be define at one place (@see RFC6750)");
        token = request.body["access_token"];
      }

      // test bearer token in the authorization header
      if (request.headers.authorization) {
        const parts = request.headers.authorization.split(" ");
        if (parts.length === 2 && parts[0] === "Bearer") {
          this.log.info(`Found token in headers`);
          if (token) throw Boom.badRequest("Bearer token can only be define at one place (@see RFC6750)");
          token = parts[1];
        }
      }

      // verify that the token is in the cache
      if (token) {
        const user: User = this.cache.get<User>(token);
        if (user) {
          this.log.info(`Token find in cache, user is`, user);
          resolve(user);
        } else {
          reject(Boom.unauthorized("Bad access token (or user not found in cache)"));
        }
      } else {
        reject(Boom.unauthorized("Bearer token not present"));
      }
    });
  }
}
