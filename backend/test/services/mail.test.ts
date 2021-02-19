import * as assert from "assert";
import { MailService } from "../../src/services/mail";

let service: MailService = null;

describe("Testing Service Mail", () => {
  before(() => {
    service = new MailService();
  });

  it("Should send an email", async () => {
    await assert.doesNotReject(
      service.send(
        "from@yopmail.com",
        "user@yopmail.com",
        ["dest1@yopmail.com", "dest2@yopmail.com"],
        "Just a test",
        "bulding",
      ),
    );
  });
  it("Should return an error with an invalid from", async () => {
    await assert.rejects(
      service.send("", "user@yopmail.com", ["dest1@yopmail.com", "dest2@yopmail.com"], "Just a test", "bulding"),
    );
  });
  it("Should return an error with an invalid replyTo", async () => {
    await assert.rejects(service.send("", "XXX", ["dest1@yopmail.com", "dest2@yopmail.com"], "Just a test", "bulding"));
  });
  it("Should return an error with an invalid to (empty array)", async () => {
    await assert.rejects(service.send("from@yopmail.com", "user@yopmail.com", [], "Just a test", "bulding"));
  });
  it("Should return an error with an invalid to (bad value)", async () => {
    await assert.rejects(service.send("from@yopmail.com", "user@yopmail.com", ["Hey"], "Just a test", "bulding"));
  });
  it("Should return an error with an invalid to (undefined)", async () => {
    await assert.rejects(service.send("from@yopmail.com", "user@yopmail.com", undefined, "Just a test", "bulding"));
  });
});
