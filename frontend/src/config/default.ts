// Default configuration file
export const config_default = {
  api_path: "/api/v1",
  iiif_path: "/iiif",
  auth: {
    authority: "https://accounts.google.com",
    client_id: "118173508985-pk9j97rcj7ivfpf1c1scuekfsmdqefn7.apps.googleusercontent.com",
    redirect_uri:
      window.location.protocol +
      "//" +
      window.location.hostname +
      (window.location.port ? ":" + window.location.port : "") +
      "/authentication/callback",
    post_logout_redirect_uri:
      window.location.protocol +
      "//" +
      window.location.hostname +
      (window.location.port ? ":" + window.location.port : "") +
      "/",
    silent_redirect_uri:
      window.location.protocol +
      "//" +
      window.location.hostname +
      (window.location.port ? ":" + window.location.port : "") +
      "/authentication/silent_callback",
    scope: "openid profile email",
    response_type: "code",
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
