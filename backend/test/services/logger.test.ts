import * as assert from "assert";
import { Logger, getLogger } from "../../src/services/logger";

let log: Logger = getLogger("TEST");

describe("Testing Logger", () => {
  it("Error logging without params should work", async () => {
    assert.doesNotThrow(() => {
      log.error("Error logging should work");
    });
  });
  it("Error logging with params should work", async () => {
    assert.doesNotThrow(() => {
      log.error("Error logging with params should work", { test: "TEST" });
    });
  });
  it("Warn logging without params should work", async () => {
    assert.doesNotThrow(() => {
      log.warn("Warn logging should work");
    });
  });
  it("Warn logging with params should work", async () => {
    assert.doesNotThrow(() => {
      log.warn("Warn logging with params should work", { test: "TEST" });
    });
  });
  it("Info logging without params should work", async () => {
    assert.doesNotThrow(() => {
      log.info("Info logging should work");
    });
  });
  it("Info logging with params should work", async () => {
    assert.doesNotThrow(() => {
      log.info("Info logging with params should work", { test: "TEST" });
    });
  });
  it("Debug logging without params should work", async () => {
    assert.doesNotThrow(() => {
      log.debug("Debug logging should work");
    });
  });
  it("Debug logging with params should work", async () => {
    assert.doesNotThrow(() => {
      log.debug("Debug logging with params should work", { test: "TEST" });
    });
  });
});
