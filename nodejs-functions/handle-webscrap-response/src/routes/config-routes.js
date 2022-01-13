import { Router } from 'express';
import { setEnvProperty, getEnvProperty } from "../utils/properties-utilities.js";
import { generateConfigHtml, validateConfig, connectToNgrok } from '../utils/test-server-utilities.js'
let router = Router();

/**
 * http route: config page
 */
router.get("/", (req, res) => {
    //shows generated config page
    res.send(generateConfigHtml());
})

/**
 * http update the configs
 */
router.post("/", (req, res) => {
    //validates the config update's request
    let validateConfigResult = validateConfig(req.body);
    let configIsValid = validateConfigResult == '';

    if (configIsValid) {
        //check if ng's token was updated, to reconnect (if it did)
        let ngtokenUpdated = getEnvProperty("NGROK_TOKEN") != req.body.ngrokToken;

        //saves all the config values to its properties files
        let saveConfigToProperties = async () => {
            try {
                await setEnvProperty("WEBSCRAPER_TOKEN", req.body.webscraperToken);
                await setEnvProperty("NGROK_TOKEN", req.body.ngrokToken);

                //response
                res.send({
                    "success": "true"
                });
            } catch (error) {
                //response
                res.send({
                    "success": "false",
                    "reason": error
                });
            }
        };
        saveConfigToProperties();

        //if the ng's token was updated, reconnects to it
        if (ngtokenUpdated) {
            connectToNgrok(req.body.ngrokToken, getEnvProperty("TEST_SERVER_PORT")).then(() => {}).catch(e => {
                console.log("Error: " + e);
                console.log("> Failed to connect to ngrok! Access http://localhost:" + getEnvProperty("TEST_SERVER_PORT") + "/config" + " to set the config info");
            });
        }
    } else {
        res.send({
            //response
            "success": "false",
            "reason": validateConfigResult + " cannot be empty"
        });
    }

});

export default router;