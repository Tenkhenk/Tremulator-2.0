import * as assert from "assert";
import * as Boom from "@hapi/boom";
import * as MockExpressRequest from "mock-express-request";
import { Container } from "typescript-ioc";
import { AuthController } from "../../src/controllers/authentification";
import { UserEntity } from "../../src/entities/user";
import { DbService } from "../../src/services/db";

const requestAuth = new MockExpressRequest({ headers: { Authorization: "Bearer QWERTYUIOP" } });
const requestBadAuth = new MockExpressRequest({ headers: { Authorization: "Bearer POIUYTREWQ" } });
const requestAnonym = new MockExpressRequest({});

const controller = new AuthController();

describe("Test Controller Auth", () => {
  before(async () => {
    // init the db connection
    await Container.get(DbService).initialize();

    // Create / update test user
    const user = new UserEntity();
    user.email = "jhon.doe@yopmail.com";
    user.firstname = "John";
    user.lastname = "Doe";
    user.access_token = "QWERTYUIOP";
    user.expires_at = new Date(Date.now() + 60 * 1000);
    await user.save();
  });

  it("Validate without `client_id` should failed", async () => {
    await assert.rejects(
      controller.validate_code({
        client_id: "",
        code: "CODE",
        code_verifier: "VERIF",
        grant_type: "GRANT",
        redirect_uri: "URL",
      }),
      Boom.badRequest("Parameter `client_id` is mandatory and should not be null or empty"),
    );
  });

  it("Validate without `code` should failed", async () => {
    await assert.rejects(
      controller.validate_code({
        client_id: "ID",
        code: "",
        code_verifier: "VERIF",
        grant_type: "GRANT",
        redirect_uri: "URL",
      }),
      Boom.badRequest("Parameter `code` is mandatory and should not be null or empty"),
    );
  });

  it("Validate without `code_verifier` should failed", async () => {
    await assert.rejects(
      controller.validate_code({
        client_id: "ID",
        code: "CODE",
        code_verifier: "",
        grant_type: "GRANT",
        redirect_uri: "URL",
      }),
      Boom.badRequest("Parameter `code_verifier` is mandatory and should not be null or empty"),
    );
  });

  it("Validate without `grant_type` should failed", async () => {
    await assert.rejects(
      controller.validate_code({
        client_id: "ID",
        code: "CODE",
        code_verifier: "VERIF",
        grant_type: "",
        redirect_uri: "URL",
      }),
      Boom.badRequest("Parameter `grant_type` is mandatory and should not be null or empty"),
    );
  });

  it("Validate without `redirect_uri` should failed", async () => {
    await assert.rejects(
      controller.validate_code({
        client_id: "ID",
        code: "CODE",
        code_verifier: "VERIF",
        grant_type: "GRANT",
        redirect_uri: "",
      }),
      Boom.badRequest("Parameter `redirect_uri` is mandatory and should not be null or empty"),
    );
  });

  it("Whoami with a valid token should return the user's profile", async () => {
    let result = await controller.whoami(requestAuth);
    assert.equal(result.email, "jhon.doe@yopmail.com");
    assert.equal(result.firstname, "John");
    assert.equal(result.lastname, "Doe");
  });

  it("Whoami with an invalid token should return a 401", async () => {
    await assert.rejects(controller.whoami(requestBadAuth), Boom.unauthorized("Bad access token"));
  });

  it("Whoami without a token should return a 401", async () => {
    await assert.rejects(controller.whoami(requestAnonym), Boom.unauthorized("Bearer token not present"));
  });
});
