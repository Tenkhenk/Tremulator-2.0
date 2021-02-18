import { components } from "./api";

export type User = Omit<components["schemas"]["UserModel"], "access_token" | "expires_at">;
