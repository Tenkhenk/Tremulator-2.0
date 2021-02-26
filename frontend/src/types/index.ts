import { components } from "./api";

export type UserType = Omit<components["schemas"]["UserModel"], "access_token" | "expires_at">;
export type CollectionType = components["schemas"]["CollectionModel"];
export type NewCollectionType = components["schemas"]["CollectionModelWithoutId"];
export type CollectionFullType = components["schemas"]["CollectionModelFull"];

export interface AlertMessage {
  message: string;
  type: string;
}
