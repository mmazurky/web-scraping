//initializes the libraries
import { getProperty } from "./utils/properties-utilities.js";
import { configExpress, validateWebscraperToken } from "./utils/test-server-utilities.js";
import ConfigRoutes from "./routes/config-routes.js"
import ScrapRoutes from "./routes/scrap-routes.js"
import express from 'express';

// defines the server port
let serverPort = getProperty("server", "port");

// initializes the express
let app = express();
// configures the express
configExpress(app);

/**
 * Starts the server
 */
 app.listen(serverPort, () => {
  console.log(`================ SCRAP REQUEST MODULE STARTED! ================`);

  //validates if the webscraper's token is filled in properties file
  if (!validateWebscraperToken()) {
    console.log("> A webscraper token is needed to perform the tests. You must set it in the config page.")
  }

  console.log("> To configure the webscraper token, access " + "http://localhost:" + serverPort + "/config");
  console.log("> Access http://localhost:" + serverPort + "/scrap for tests");
});

/**
 * Adds the Scrap routes
 */
 app.use('/scrap', ScrapRoutes);

/**
 * Adds the Config routes
 */
 app.use('/config', ConfigRoutes);