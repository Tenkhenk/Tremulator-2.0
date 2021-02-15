import * as express from "express";
import { Container } from "typescript-ioc";
import { AuthService } from "./services/authentification";
import { UserEntity } from "./entities/user";
import { config } from "./config";

const auth: AuthService = Container.get(AuthService);

/* eslint-disable @typescript-eslint/no-unused-vars */
export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[],
): Promise<UserEntity> {
  return new Promise(async (resolve, reject) => {
    if (securityName === "auth") {
      try {
        const user = await auth.verify(request);
        resolve(user);
      } catch (e) {
        reject(e);
      }
      reject();
    }
  });
}
