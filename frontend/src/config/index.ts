import { UserManagerSettings } from "oidc-client";
import { config_default } from "./default";

// Type for the config object
export interface Configuration {
  api_path: string;
  iiif_path: string;
  annotations_page_limit: number;
  // The max size of upload in bytes.
  // this configuration must match the `client_max_body_size` of nginx
  max_upload_size: number;
  auth: UserManagerSettings;
  schema_colors: Array<string>;
  mime_types: Array<string>;
}

const config: Configuration = config_default;

export { config };
