import { JSONSchema7 } from "json-schema";
import { components } from "./api";

export type UserType = Omit<components["schemas"]["UserModel"], "access_token" | "expires_at">;
export type CollectionType = components["schemas"]["CollectionModel"];
export type NewCollectionType = components["schemas"]["CollectionModelWithoutId"];
export type CollectionFullType = components["schemas"]["CollectionModelFull"];
export type ImageType = components["schemas"]["ImageModel"];
export type ImageFullType = components["schemas"]["ImageModelFull"];
export type NewSchemaType = components["schemas"]["SchemaModelWithoutId"];
export type SchemaType = components["schemas"]["SchemaModel"];

export interface AlertMessage {
  message: string;
  type: string;
}

export const collectionSchema: JSONSchema7 = {
  type: "object",
  required: ["name"],
  properties: {
    name: {
      type: "string",
      title: "Name",
    },
    description: {
      type: "string",
      title: "Description",
    },
  },
};

export const collectionUiSchema: any = {
  description: {
    "ui:widget": "textarea",
  },
};
