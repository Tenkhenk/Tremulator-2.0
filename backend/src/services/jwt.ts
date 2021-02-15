import * as jwksRsa from "jwks-rsa";
import * as jwt from "jsonwebtoken";
import { Singleton } from "typescript-ioc";
import { getLogger, Logger } from "./logger";
import { config } from "../config";
import { UserEntity } from "../entities/user";

/* eslint-disable @typescript-eslint/no-use-before-define */
@Singleton
export class JwtService {
  // Logger
  private log: Logger = getLogger("JwtService");
  // RSA JWT validator
  jwksClient: jwksRsa.JwksClient;

  constructor() {
    this.log.info(`JWKS Authority url is`, config.auth.authority_jwks_uri);
    this.jwksClient = jwksRsa({
      strictSsl: true, // Default value
      jwksUri: config.auth.authority_jwks_uri,
    });
  }

  verify(token: string): Promise<UserEntity> {
    this.log.info(`Verifying token`, token);
    const getKey = (header, callback): void => {
      this.jwksClient.getSigningKey(header.kid, (err, key) => {
        this.log.debug(`response of siging key is`, { key, err });
        if (err) {
          callback(err, null);
        } else {
          const signingKey = key["publicKey"] || key["rsaPublicKey"];
          callback(null, signingKey);
        }
      });
    };

    return new Promise((resolve, reject) => {
      const parseResult = (err, decoded): void => {
        if (err) {
          this.log.error(`Error when validating token`, err);
          reject(err);
        }
        this.log.debug(`Decoded token is`, decoded);
        resolve(decoded);
      };
      jwt.verify(token, getKey, {}, parseResult);
    });
  }
}
