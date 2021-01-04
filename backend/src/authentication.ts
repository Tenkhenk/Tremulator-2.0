import * as express from "express";
import { Container } from "typescript-ioc";
import { AuthService } from "./services/authentification";
import { User } from "./entities/user";
import { config } from "./config";

const auth: AuthService = Container.get(AuthService);

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[],
): Promise<User> {
  return new Promise((resolve, reject) => {
    if (securityName === "auth") {
      try {
        resolve(auth.verify(request));
      } catch (e) {
        reject(e);
      }
      reject();
    }
  });
}
