import { JSONSchema7 } from "json-schema";
import { components } from "./api";

export type UserType = Omit<components["schemas"]["UserModel"], "access_token" | "expires_at">;

// Types for collection
export type NewCollectionType = components["schemas"]["CollectionModelWithoutId"];
export type CollectionType = components["schemas"]["CollectionModel"];
export type CollectionFullType = components["schemas"]["CollectionModelFull"];

// Types for Image
export type ImageType = components["schemas"]["ImageModel"];
export type ImageFullType = components["schemas"]["ImageModelFull"];

// Types for schema
export type NewSchemaType = components["schemas"]["SchemaModelWithoutId"];
export type SchemaType = components["schemas"]["SchemaModel"];
export type SchemaFullType = components["schemas"]["SchemaModelFull"];

// Types for annotation
export type NewAnnotationType = components["schemas"]["AnnotationModelWithoutId"];
export type AnnotationType = components["schemas"]["AnnotationModel"];

export interface AlertMessage {
  message: string;
  type: string;
}

export interface JsonSchemaForm {
  schema: JSONSchema7;
  ui?: any;
}

export const collectionSchemaForm: JsonSchemaForm = {
  schema: {
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
  },
  ui: {
    description: {
      "ui:widget": "textarea",
    },
  },
};

export const schemaSchemaForm: JsonSchemaForm = {
  schema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        title: "Name",
      },
      color: {
        type: "string",
        title: "Color",
      },
      fields: {
        type: "array",
        title: "Form's fields",
        items: {
          type: "object",
          required: ["name", "type"],
          properties: {
            name: {
              type: "string",
              title: "Name",
            },
            required: {
              type: "boolean",
              title: "Required",
            },
            type: {
              type: "string",
              title: "Type",
              default: "string",
              enum: ["string", "boolean", "number", "textarea", "select", "range"],
            },
          },
          dependencies: {
            type: {
              oneOf: [
                {
                  properties: {
                    type: { enum: ["string"] },
                  },
                },
                {
                  properties: {
                    type: { enum: ["textarea"] },
                  },
                },
                {
                  properties: {
                    type: { enum: ["number"] },
                  },
                },
                {
                  properties: {
                    type: { enum: ["select"] },
                    values: {
                      type: "array",
                      title: "List of values",
                      items: {
                        title: "Value",
                        type: "string",
                      },
                    },
                  },
                },
                {
                  properties: {
                    type: { enum: ["range"] },
                    min: {
                      title: "Min. value",
                      type: "number",
                      default: 0,
                    },
                    max: {
                      title: "Max. value",
                      type: "number",
                      default: 100,
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
  ui: {
    color: {
      "ui:widget": "color",
    },
    schema: {
      "ui:widget": "textarea",
    },
    ui: {
      "ui:widget": "textarea",
    },
  },
};
