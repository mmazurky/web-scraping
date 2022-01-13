//initializes the libraries
import { getProperty } from "./utils/properties-utilities.js";
import { configExpress, connectToNgrok, validateNgrokToken } from "./utils/test-server-utilities.js";
import ConfigRoutes from "./routes/config-routes.js"
import ResultRoutes from "./routes/result-routes.js"
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
app.listen(serverPort, (err) => {
    if (err) return console.log(`An error has occurred: ${err}`);
    console.log(`================ SCRAP RESPONSE MODULE STARTED! ================`);

    //validates if the ng's token is filled in properties file
    if (validateNgrokToken()) {
        //connects to ngrok to get a public url
        connectToNgrok(getProperty("ngrok", "token"), getProperty("server", "port")).then(() => {}).catch(e => {});
    } else {
        console.log("> Access http://localhost:" + serverPort + "/config" + " to set the config info");
    }
});

/**
 * Adds the Result routes
 */
 app.use('/result', ResultRoutes);

/**
 * Adds the Config routes
 */
 app.use('/config', ConfigRoutes);