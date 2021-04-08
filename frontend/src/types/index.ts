import { JSONSchema7 } from "json-schema";
import { components } from "./api";

export type UserType = Omit<components["schemas"]["UserModel"], "access_token" | "expires_at">;

// Types for collection
export type CollectionData = components["schemas"]["CollectionData"];
export type CollectionModel = components["schemas"]["CollectionModel"];
export type CollectionModelFull = components["schemas"]["CollectionModelFull"];

// Types for Image
export type ImageModel = components["schemas"]["ImageModel"];
export type ImageModelFull = components["schemas"]["ImageModelFull"];

// Types for schema
export type SchemaData = components["schemas"]["SchemaData"];
export type SchemaModel = components["schemas"]["SchemaModel"];
export type SchemaModelFull = components["schemas"]["SchemaModelFull"];

// Types for annotation
export type AnnotationData = components["schemas"]["AnnotationData"];
export type AnnotationModel = components["schemas"]["AnnotationModel"];
export type AnnotationModelFull = components["schemas"]["AnnotationModelFull"];

//Types for user
export type UserModel = components["schemas"]["UserModel"];

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
    required: ["name", "color"],
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
        minItems: 1,
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
                    type: { enum: ["boolean"] },
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

export const collectionUserForm: JsonSchemaForm = {
  schema: {
    type: "object",
    required: ["email"],
    properties: {
      email: {
        type: "string",
        title: "Email",
      },
    },
  },
  ui: {},
};
