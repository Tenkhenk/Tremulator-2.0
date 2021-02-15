import * as assert from "assert";
import * as Boom from "@hapi/boom";
import { AuthController } from "../../src/controllers/authentification";
import { dbInitWithUser, requestAnonym, requestJhon, requestBadAuth, jhon } from "../utils";

const controller = new AuthController();

describe("Test Controller Auth", () => {
  before(async () => {
    await dbInitWithUser();
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
    let result = await controller.whoami(requestJhon);
    assert.equal(result.email, jhon.email);
    assert.equal(result.firstname, jhon.firstname);
    assert.equal(result.lastname, jhon.lastname);
  });

  it("Whoami with an invalid token should return a 401", async () => {
    await assert.rejects(controller.whoami(requestBadAuth), Boom.unauthorized("Bad access token"));
  });

  it("Whoami without a token should return a 401", async () => {
    await assert.rejects(controller.whoami(requestAnonym), Boom.unauthorized("Bearer token not present"));
  });
});
