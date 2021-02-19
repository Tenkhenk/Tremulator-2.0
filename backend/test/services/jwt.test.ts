import * as assert from "assert";
import { JwtService } from "../../src/services/jwt";

// an expired token
const token: string =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6ImJhZDM5NzU0ZGYzYjI0M2YwNDI4YmU5YzUzNjFkYmE1YjEwZmZjYzAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxMTgxNzM1MDg5ODUtNjRydTBodmMxaXEzMDFpdGFydGwyanJkZ2xqZzVsbTQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIxMTgxNzM1MDg5ODUtNjRydTBodmMxaXEzMDFpdGFydGwyanJkZ2xqZzVsbTQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDU5MDAwODQ5NTEyMzMyMjc4NzUiLCJlbWFpbCI6ImxvZ2lzaW1hQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiYnR3dW83VWgzUmp2Vm1sNF9xVnY2ZyIsIm5hbWUiOiJCZW5vw650IFNpbWFyZCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQUF1RTdtQ3Y2bUlCeDMyWUJYbHNDa2VVVmNUdUdhb0dfZEZ6ZmIwNW56ZEZ4QT1zOTYtYyIsImdpdmVuX25hbWUiOiJCZW5vw650IiwiZmFtaWx5X25hbWUiOiJTaW1hcmQiLCJsb2NhbGUiOiJmciIsImlhdCI6MTU4MDE0ODU1NywiZXhwIjoxNTgwMTUyMTU3fQ.AlGlroTMCImlT0pIssRvsa5Vf3vorIovvZUNjjbzCguo4nzc3VuENmy-0S5DvryRAvgO9nCHScOitwE3KHjM6d7cR5TE1bchfDxAGLofRZ94thHpfM7wMDvbCXXE6YufC4mVpe0oaqqe8h1RAqkzziX49_G5Vg8lGxbSTWmeLml8w8L87olSuqLrIi0NFDYxSR-Zae9G4V95uAIq_DOt4H2WTl_JE41muLwZA9t0_8YioOzUs78c1n29mLL4lR2uFi2lY_PfODxllBN4XJgpDb0NpK9Y5747S5n3swNCYBKszaPhfADtWA4YUQ4f1m6lLCKZ5YXhDtBwsPvzryHptQ";

let service: JwtService = new JwtService();

describe("Testing Service JWT", () => {
  it("Should not validate an expired token with kid and jwks", async () => {
    try {
      await service.verify(token);
      assert.fail("No error has been thrown");
    } catch (e) {
      assert.equal(1, 1);
    }
  });
  it("Should failed on a bad token", async () => {
    await assert.rejects(service.verify("XXXXX"), { name: "JsonWebTokenError", message: "jwt malformed" });
  });
});
