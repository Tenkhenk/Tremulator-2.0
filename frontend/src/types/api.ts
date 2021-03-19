/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/collections/{collectionId}/images/{imageId}/annotations": {
    post: operations["Create"];
  };
  "/collections/{collectionId}/images/{imageId}/annotations/{id}": {
    get: operations["Get"];
    put: operations["Update"];
    delete: operations["Delete"];
  };
  "/auth/validate_code": {
    post: operations["Validate_code"];
  };
  "/auth/whoami": {
    get: operations["Whoami"];
  };
  "/collections": {
    /** Make a search in the collections. */
    get: operations["Search"];
    /** Creates a new collection. */
    post: operations["Create"];
  };
  "/collections/{id}": {
    /** Retrieves a collection by its ID. */
    get: operations["Get"];
    /** Update a collection */
    put: operations["Update"];
    /**
     * Delete a collection.
     * Only the owner of a collection can delete it.
     */
    delete: operations["Delete"];
  };
  "/collections/{id}/users": {
    /** Search users (in firstanme, lastname and email) that have access to the collection. */
    get: operations["UsersSearch"];
    /**
     * Add a user (via its email) to the collection.
     * The email must match a valid a user, otherwise a 400 is returned.
     */
    put: operations["UserAdd"];
    /**
     * Remove a user (via its email) from the collection.
     * If the email is the one of the collection's owner, a 403 is returned.
     */
    delete: operations["UserDelete"];
  };
  "/collections/{collectionId}/images/order": {
    /**
     * Update the images order on the collection.
     * You should send an array of image's id in the good order.
     */
    put: operations["ImagesOrder"];
  };
  "/collections/{collectionId}/images/upload": {
    /** Create images in the collection by uploading a files (via an array of files). */
    post: operations["Upload"];
  };
  "/collections/{collectionId}/images/download": {
    /** Create images in the collection by specifying a list of url to download. */
    post: operations["Download"];
  };
  "/collections/{collectionId}/images/{id}": {
    /** Get an image from the collection. */
    get: operations["Get"];
    /** Update an image from the collection (just the metadata). */
    put: operations["Update"];
    /** Delete an image from the collection. */
    delete: operations["Delete"];
  };
  "/collections/{collectionId}/images/{id}/next": {
    /** Get the next image from the collection. */
    get: operations["Next"];
  };
  "/collections/{collectionId}/images/{id}/previous": {
    /** Get the previous image from the collection. */
    get: operations["Previous"];
  };
  "/misc/ping": {
    get: operations["Ping"];
  };
  "/misc/echo": {
    post: operations["Echo"];
  };
  "/misc/lock_user": {
    put: operations["Lock_user"];
  };
  "/collections/{collectionId}/schema": {
    /** Create a schema for a collection. */
    post: operations["Create"];
  };
  "/collections/{collectionId}/schema/{id}": {
    /** Get a schema from the collection. */
    get: operations["Get"];
    /** Update a schema from the collection. */
    put: operations["Update"];
    /** Delete an schema from the collection and its related annotations. */
    delete: operations["Delete"];
  };
}

export interface components {
  schemas: {
    /** From T, pick a set of properties whose keys are in the union K */
    "Pick_AnnotationEntity.id-or-data_": {
      id: number;
      data: { [key: string]: any };
    };
    /** Object model: just the table properties */
    AnnotationModel: components["schemas"]["Pick_AnnotationEntity.id-or-data_"] & {
      geometry: { [key: string]: any };
    };
    /** From T, pick a set of properties whose keys are in the union K */
    "Pick_AnnotationModel.Exclude_keyofAnnotationModel.id__": {
      data: { [key: string]: any };
      geometry: { [key: string]: any };
    };
    "Omit_AnnotationModel.id_": components["schemas"]["Pick_AnnotationModel.Exclude_keyofAnnotationModel.id__"];
    AnnotationModelWithoutId: components["schemas"]["Omit_AnnotationModel.id_"];
    /** From T, pick a set of properties whose keys are in the union K */
    "Pick_SchemaEntity.id-or-name-or-ui-or-color_": {
      id: number;
      name: string;
      ui: { [key: string]: any };
      color: string;
    };
    /** Object model: just the table properties */
    SchemaModel: components["schemas"]["Pick_SchemaEntity.id-or-name-or-ui-or-color_"] & {
      schema: { [key: string]: { [key: string]: any } };
    };
    /** From T, pick a set of properties whose keys are in the union K */
    "Pick_ImageEntity.id-or-name-or-url_": {
      id: number;
      name: string;
      url: string;
    };
    /** Object model: just the table properties */
    ImageModel: components["schemas"]["Pick_ImageEntity.id-or-name-or-url_"];
    /** Object full : model with the deps in model format */
    AnnotationModelFull: components["schemas"]["Pick_AnnotationEntity.id-or-data_"] & {
      image: components["schemas"]["ImageModel"];
      schema: components["schemas"]["SchemaModel"];
      geometry: {
        type: string;
      };
    };
    ValidateCodeResponse: {
      access_token: string;
      expires_in: number;
      scope: string;
      token_type: string;
      id_token: string;
    };
    ValidateCodeRequest: {
      client_id: string;
      code: string;
      code_verifier: string;
      grant_type: string;
      redirect_uri?: string;
    };
    /** From T, pick a set of properties whose keys are in the union K */
    "Pick_UserEntity.email-or-firstname-or-lastname-or-avatar-or-access_token-or-expires_at_": {
      email: string;
      firstname: string;
      lastname: string;
      avatar: string;
      access_token: string;
      expires_at: string;
    };
    /** Object full */
    UserModelFull: components["schemas"]["Pick_UserEntity.email-or-firstname-or-lastname-or-avatar-or-access_token-or-expires_at_"];
    /** From T, pick a set of properties whose keys are in the union K */
    "Pick_CollectionEntity.id-or-name-or-description_": {
      id: number;
      name: string;
      description: string;
    };
    /** Object model: just the table properties */
    CollectionModel: components["schemas"]["Pick_CollectionEntity.id-or-name-or-description_"];
    /** From T, pick a set of properties whose keys are in the union K */
    "Pick_CollectionModel.Exclude_keyofCollectionModel.id__": {
      name: string;
      description: string;
    };
    "Omit_CollectionModel.id_": components["schemas"]["Pick_CollectionModel.Exclude_keyofCollectionModel.id__"];
    CollectionModelWithoutId: components["schemas"]["Omit_CollectionModel.id_"];
    /** From T, pick a set of properties whose keys are in the union K */
    "Pick_UserEntity.email-or-firstname-or-lastname-or-avatar_": {
      email: string;
      firstname: string;
      lastname: string;
      avatar: string;
    };
    /** Object summary */
    UserModel: components["schemas"]["Pick_UserEntity.email-or-firstname-or-lastname-or-avatar_"];
    /** Object full */
    CollectionModelFull: components["schemas"]["Pick_CollectionEntity.id-or-name-or-description_"] & {
      schemas: components["schemas"]["SchemaModel"][];
      images: components["schemas"]["ImageModel"][];
      users: components["schemas"]["UserModel"][];
      owner: components["schemas"]["UserModel"];
    };
    /** Object full */
    ImageModelFull: components["schemas"]["ImageModel"] & {
      annotations: components["schemas"]["AnnotationModel"][];
      collection: components["schemas"]["CollectionModel"];
    };
    /** From T, pick a set of properties whose keys are in the union K */
    "Pick_SchemaModel.Exclude_keyofSchemaModel.id__": {
      name: string;
      ui: { [key: string]: any };
      color: string;
      schema: { [key: string]: { [key: string]: any } };
    };
    "Omit_SchemaModel.id_": components["schemas"]["Pick_SchemaModel.Exclude_keyofSchemaModel.id__"];
    SchemaModelWithoutId: components["schemas"]["Omit_SchemaModel.id_"];
    /** Object full */
    SchemaModelFull: components["schemas"]["SchemaModel"] & {
      annotations: components["schemas"]["AnnotationModel"][];
      collection: components["schemas"]["CollectionModel"];
    };
  };
  responses: {};
  parameters: {};
  requestBodies: {};
  headers: {};
}

export interface operations {
  /** Create a schema for a collection. */
  Create: {
    parameters: {
      path: {
        collectionId: number;
      };
    };
    responses: {
      /** Ok */
      200: {
        content: {
          "application/json": components["schemas"]["SchemaModel"];
        };
      };
      /** Created */
      201: unknown;
      /** Bad Request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Forbidden */
      403: unknown;
      /** Not Found */
      404: unknown;
      /** Internal Error */
      500: unknown;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["SchemaModelWithoutId"];
      };
    };
  };
  /** Get a schema from the collection. */
  Get: {
    parameters: {
      path: {
        collectionId: number;
        id: number;
      };
    };
    responses: {
      /** Ok */
      200: {
        content: {
          "application/json": components["schemas"]["SchemaModelFull"];
        };
      };
      /** Bad Request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Forbidden */
      403: unknown;
      /** Not Found */
      404: unknown;
      /** Internal Error */
      500: unknown;
    };
  };
  /** Update a schema from the collection. */
  Update: {
    parameters: {
      path: {
        collectionId: number;
        id: number;
      };
    };
    responses: {
      /** No content */
      204: never;
      /** Bad request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Forbidden */
      403: unknown;
      /** Not found */
      404: unknown;
      /** Internal Error */
      500: unknown;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["SchemaModel"];
      };
    };
  };
  /** Delete an schema from the collection and its related annotations. */
  Delete: {
    parameters: {
      path: {
        collectionId: number;
        id: number;
      };
    };
    responses: {
      /** No content */
      204: never;
      /** Bad request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Forbidden */
      403: unknown;
      /** Not found */
      404: unknown;
      /** Internal Error */
      500: unknown;
    };
  };
  Validate_code: {
    parameters: {};
    responses: {
      /** Ok */
      200: {
        content: {
          "application/json": components["schemas"]["ValidateCodeResponse"];
        };
      };
      /** Internal Error */
      500: unknown;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ValidateCodeRequest"];
      };
    };
  };
  Whoami: {
    parameters: {};
    responses: {
      /** Ok */
      200: {
        content: {
          "application/json": components["schemas"]["UserModelFull"];
        };
      };
      /** Unauthorized */
      401: unknown;
      /** Forbidden */
      403: unknown;
      /** Internal Error */
      500: unknown;
    };
  };
  /** Make a search in the collections. */
  Search: {
    parameters: {
      query: {
        search?: string;
        skip?: number;
        limit?: number;
      };
    };
    responses: {
      /** Ok */
      200: {
        content: {
          "application/json": components["schemas"]["CollectionModel"][];
        };
      };
      /** Bad Request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Internal Error */
      500: unknown;
    };
  };
  /** Search users (in firstanme, lastname and email) that have access to the collection. */
  UsersSearch: {
    parameters: {
      path: {
        id: number;
      };
      query: {
        search?: string;
        skip?: number;
        limit?: number;
      };
    };
    responses: {
      /** Ok */
      200: {
        content: {
          "application/json": components["schemas"]["UserModel"][];
        };
      };
      /** Bad Request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Internal Error */
      500: unknown;
    };
  };
  /**
   * Add a user (via its email) to the collection.
   * The email must match a valid a user, otherwise a 400 is returned.
   */
  UserAdd: {
    parameters: {
      path: {
        id: number;
      };
    };
    responses: {
      /** No content */
      204: never;
      /** Bad Request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Forbidden */
      403: unknown;
      /** Internal Error */
      500: unknown;
    };
    requestBody: {
      content: {
        "application/json": {
          email: string;
        };
      };
    };
  };
  /**
   * Remove a user (via its email) from the collection.
   * If the email is the one of the collection's owner, a 403 is returned.
   */
  UserDelete: {
    parameters: {
      path: {
        id: number;
      };
    };
    responses: {
      /** No content */
      204: never;
      /** Bad request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Forbidden */
      403: unknown;
      /** Not found */
      404: unknown;
      /** Internal Error */
      500: unknown;
    };
    requestBody: {
      content: {
        "application/json": {
          email: string;
        };
      };
    };
  };
  /**
   * Update the images order on the collection.
   * You should send an array of image's id in the good order.
   */
  ImagesOrder: {
    parameters: {
      path: {
        collectionId: number;
      };
    };
    responses: {
      /** No content */
      204: never;
      /** Bad Request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Forbidden */
      403: unknown;
      /** Not Found */
      404: unknown;
      /** Internal Error */
      500: unknown;
    };
    requestBody: {
      content: {
        "application/json": {
          order: number[];
        };
      };
    };
  };
  /** Create images in the collection by uploading a files (via an array of files). */
  Upload: {
    parameters: {
      path: {
        collectionId: number;
      };
    };
    responses: {
      /** Ok */
      200: {
        content: {
          "application/json": components["schemas"]["ImageModel"][];
        };
      };
      /** Created */
      201: unknown;
      /** Bad Request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Forbidden */
      403: unknown;
      /** Not Found */
      404: unknown;
      /** Internal Error */
      500: unknown;
    };
    requestBody: {
      content: {
        "multipart/form-data": {
          files?: string[];
        };
      };
    };
  };
  /** Create images in the collection by specifying a list of url to download. */
  Download: {
    parameters: {
      path: {
        collectionId: number;
      };
    };
    responses: {
      /** Ok */
      200: {
        content: {
          "application/json": components["schemas"]["ImageModel"][];
        };
      };
      /** Created */
      201: unknown;
      /** Bad Request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Forbidden */
      403: unknown;
      /** Not Found */
      404: unknown;
      /** Internal Error */
      500: unknown;
    };
    requestBody: {
      content: {
        "application/json": {
          urls: string[];
        };
      };
    };
  };
  /** Get the next image from the collection. */
  Next: {
    parameters: {
      path: {
        collectionId: number;
        id: number;
      };
    };
    responses: {
      /** Ok */
      200: {
        content: {
          "application/json": components["schemas"]["ImageModelFull"];
        };
      };
      /** No Content */
      204: never;
      /** Bad Request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Forbidden */
      403: unknown;
      /** Not Found */
      404: unknown;
      /** Internal Error */
      500: unknown;
    };
  };
  /** Get the previous image from the collection. */
  Previous: {
    parameters: {
      path: {
        collectionId: number;
        id: number;
      };
    };
    responses: {
      /** Ok */
      200: {
        content: {
          "application/json": components["schemas"]["ImageModelFull"];
        };
      };
      /** No Content */
      204: never;
      /** Bad Request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
      /** Forbidden */
      403: unknown;
      /** Not Found */
      404: unknown;
      /** Internal Error */
      500: unknown;
    };
  };
  Ping: {
    parameters: {};
    responses: {
      /** Ok */
      200: {
        content: {
          "application/json": string;
        };
      };
    };
  };
  Echo: {
    parameters: {};
    responses: {
      /** Ok */
      200: {
        content: {
          "application/json": { [key: string]: any };
        };
      };
    };
    requestBody: {
      content: {
        "application/json": { [key: string]: any };
      };
    };
  };
  Lock_user: {
    parameters: {};
    responses: {
      /** No content */
      204: never;
      /** Bad request */
      400: unknown;
      /** Unauthorized */
      401: unknown;
    };
    requestBody: {
      content: {
        "application/json": {
          lock?: boolean;
          email: string;
        };
      };
    };
  };
}
