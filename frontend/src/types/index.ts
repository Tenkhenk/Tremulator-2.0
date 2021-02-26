import { components } from "./api";

export type User = Omit<components["schemas"]["UserModel"], "access_token" | "expires_at">;
export type Collection = components["schemas"]["CollectionModel"];
export type NewCollection = components["schemas"]["CollectionModelWithoutId"];
