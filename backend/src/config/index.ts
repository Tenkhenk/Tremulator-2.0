import { merge } from "lodash";
import { TransportOptions } from "nodemailer";
import { config_default } from "./default";
import * as config_dev from "./dev.json";
import * as config_test from "./test.json";
import * as config_production from "./production.json";

export interface Configuration {
  // The port number of the server
  port: number;
  // Should we display stack on error
  error_with_stack: boolean;
  // Smtp configuration
  smtp: TransportOptions;
  // Email adddress
  noreply_address: string;
  // Data configuration
  data: {
    // Path to the upload folder
    path: string;
    // List of allowed mime-types for images
    mime_types: Array<string>;
  };
  // Logging configuration
  logs: {
    // debug, info, warn, error
    console_level: string;
    // debug, info, warn, error
    file_level: string;
    // The maximum size of file for the rotation system.
    // Ex : "20m"
    file_maxsize: string;
    // Retention policy for the log files.
    // Can be a number for the number of files we need to keep, or a duration  like 7d
    file_retention: string;
    // folder where we store the logs files
    // it's a relative path from where you start the app or an absolute path (better)
    file_path: string;
  };
  auth: {
    // The client ID for the OpenID Connect
    client_id: string;
    // The client secret for the OpenID Connect.
    // Perhaps it's not needed if the provider support PKCS.
    client_secret?: string;
    // The provider endpoint where to validate a token
    authority_token_endpoint: string;
    // The provider endpoint where we can retrieve certificates for the json web tokens
    authority_jwks_uri: string;
    // The provider endpoint where we can retrieve user info
    userinfo_endpoint: string;
  };
  db: {
    // type of the database (`postgres`)
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
  };
}

let config: Configuration;

switch (process.env.configuration) {
  case "test":
    config = merge(config_default, config_test);
    break;
  case "production":
    config = merge(config_default, config_production);
    break;
  default:
    config = merge(config_default, config_dev);
    break;
}

export { config };
