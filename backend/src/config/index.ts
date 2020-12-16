import { merge } from "lodash";
import { config_default } from "./default";
import * as config_dev from "./dev.json";
import * as config_test from "./test.json";
import * as config_docker from "./docker.json";
import * as config_production from "./production.json";

export interface Configuration {
  // The port number of the server
  port: number;
  // Should we display stack on error
  error_with_stack: boolean;
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
}

let config: Configuration;

switch (process.env.configuration) {
  case "dev":
    config = merge(config_default, config_dev);
    break;
  case "test":
    config = merge(config_default, config_test);
    break;
  case "docker":
    config = merge(config_default, config_docker);
    break;
  case "production":
    config = merge(config_default, config_production);
    break;
  default:
    config = merge(config_default, config_dev);
    break;
}

export { config };
