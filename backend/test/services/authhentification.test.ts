import * as assert from "assert";
import * as Boom from "@hapi/boom";
import * as MockExpressRequest from "mock-express-request";
import { AuthService } from "../../src/services/authentification";

const requestAuthHeader = new MockExpressRequest({ headers: { Authorization: "Bearer QWERTYUIOP" } });
const requestAuthBody = new MockExpressRequest({ body: { access_token: "QWERTYUIOP" } });
const requestAuthParam = new MockExpressRequest({ query: { access_token: "QWERTYUIOP" } });
const requestAuthMultiple = new MockExpressRequest({
  headers: { Authorization: "Bearer QWERTYUIOP" },
  body: { access_token: "QWERTYUIOP" },
});

const requestInvalid = new MockExpressRequest({ headers: { Authorization: "Bearer XXXX" } });
const requestAnonym = new MockExpressRequest({});

let service: AuthService = new AuthService();

describe("Testing Service Auth", () => {
  it("Valid token in params should work", async () => {
    let user = await service.verify(requestAuthParam);
    assert.equal(user.email, "jhon.doe@yopmail.com");
  });
  it("Valid token as body params should work", async () => {
    let user = await service.verify(requestAuthBody);
    assert.equal(user.email, "jhon.doe@yopmail.com");
  });
  it("Valid token in headers should work", async () => {
    let user = await service.verify(requestAuthHeader);
    assert.equal(user.email, "jhon.doe@yopmail.com");
  });
  it("Multiple token in request should fail", async () => {
    console.log("coucou");
    await assert.rejects(
      service.verify(requestAuthMultiple),
      Boom.badRequest("Bearer token can only be define at one place (@see RFC6750)"),
    );
  });
  it("Invalid token in request should fail", async () => {
    await assert.rejects(service.verify(requestInvalid), Boom.unauthorized("Bad access token"));
  });
  it("No token in request should fail", async () => {
    await assert.rejects(service.verify(requestAnonym), Boom.unauthorized("Bearer token not present"));
  });
});
