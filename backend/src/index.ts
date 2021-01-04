import * as bodyParser from "body-parser";
import * as express from "express";
import * as swaggerUi from "swagger-ui-express";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { RegisterRoutes } from "./routes";
import { getLogger, Logger } from "./services/logger";
import { errorFilter } from "./error-handler";
import { config } from "./config";
// project's services & controllers
import "./controllers/authentification";
import "./controllers/miscellaneous";
import "./services/authentification";
import "./services/jwt";
import "./services/logger";

// logger
const log: Logger = getLogger("Server");

// Create an express application
const app = express()
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", `Origin, X-Requested-With, Content-Type, Accept, Authorization`);
    next();
  });

// Swagger
app
  .use("/api/swagger.json", (req, res) => {
    res.sendFile(__dirname + "/swagger.json");
  })
  .use("/api/docs", swaggerUi.serve, swaggerUi.setup(null, { swaggerOptions: { url: "/api/swagger.json" } }));

// Register the route of the api
RegisterRoutes(app);

// Generic filter to handler errors (with the help of Boom)
app.use(errorFilter);

//  Create the db connection
createConnection({
  type: "postgres",
  entities: [__dirname + "/entities/*.js"],
  ...config.db,
})
  .then(() => {
    log.info("Database connection is OK");
    // Start the server
    const port: number = config.port;
    app.listen(port, () => {
      log.info(`✓ Started API server at http://localhost:${port}`);
    });
  })
  .catch((error) => log.error(`Failed to connect to database ${error.message}`));
