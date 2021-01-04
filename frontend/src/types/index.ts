import { components } from "./api";

export type User = Omit<components["schemas"]["User"], "access_token" | "expires_at">;
