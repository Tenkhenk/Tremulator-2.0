// Default configuration file
export const config_default = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  error_with_stack: true,
  logs: {
    console_level: process.env.CONSOLE_LOG_LEVEL || "info",
    file_level: process.env.CONSOLE_FILE_LEVEL || "error",
    file_maxsize: "200m",
    file_retention: "7d",
    file_path: "./",
  },
  auth: {
    authority_token_endpoint: process.env.AUTHORITY_TOKEN_ENDPOINT || "https://oauth2.googleapis.com/token",
    authority_jwks_uri: process.env.AUTHORITY_JWKS_URI || "https://www.googleapis.com/oauth2/v3/certs",
    userinfo_endpoint: process.env.USERFINFO_ENDPOINT || "https://openidconnect.googleapis.com/v1/userinfo",
    client_id: process.env.CLIENT_ID || "118173508985-pk9j97rcj7ivfpf1c1scuekfsmdqefn7.apps.googleusercontent.com",
    client_secret: process.env.CLIENT_SECRET || "qpQ8b6p7xm2YRho19OQ1ObH8",
  },
  db: {
    host: process.env.POSTGRES_HOST || "localhost",
    port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
    username: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    database: process.env.POSTGRES_DB || "tremulator",
    synchronize: true,
    logging: false,
  },
};
