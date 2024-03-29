import { getServerUrl } from "../utils";
// Default configuration file
export const config_default = {
  api_path: "/api/v1",
  iiif_path: "/iiif",
  schema_colors: [
    "#c45fa1",
    "#66b045",
    "#965ed0",
    "#a7963e",
    "#7679c7",
    "#cf6c31",
    "#56a7d8",
    "#d2415d",
    "#55a376",
    "#bd6e61",
  ],
  mime_types: ["image/jpeg", "image/jpg", "image/png", "image/tiff"],
  pagination_size: 50,
  max_upload_size: 209715200,
  auth: {
    authority: "https://accounts.google.com",
    client_id: process.env.REACT_APP_CLIENT_ID,
    redirect_uri: getServerUrl() + "/authentication/callback",
    post_logout_redirect_uri: getServerUrl() + "/",
    silent_redirect_uri: getServerUrl() + "/authentication/silent_callback",
    scope: "openid profile email",
    response_type: "code",
    automaticSilentRenew: true,
    filterProtocolClaims: true,
    loadUserInfo: false,
    revokeAccessTokenOnSignout: true,
    metadata: {
      issuer: "https://accounts.google.com",
      authorization_endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      device_authorization_endpoint: "https://oauth2.googleapis.com/device/code",
      token_endpoint: "/api/v1/auth/validate_code",
      userinfo_endpoint: "https://openidconnect.googleapis.com/v1/userinfo",
      revocation_endpoint: "https://oauth2.googleapis.com/revoke",
      jwks_uri: "https://www.googleapis.com/oauth2/v3/certs",
      end_session_endpoint:
        window.location.protocol +
        "//" +
        window.location.hostname +
        (window.location.port ? ":" + window.location.port : "") +
        "/auth/logout",
    },
  },
};
