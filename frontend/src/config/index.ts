import { UserManagerSettings } from "oidc-client";
import { config_default } from "./default";

// Type for the config object
export interface Configuration {
  api_path: string;
  iiif_path: string;
  auth: UserManagerSettings;
}

const config: Configuration = config_default;

export { config };
