import { Router } from 'express';
import { setEnvProperty } from "../utils/properties-utilities.js";
import { generateConfigHtml, validateConfig } from '../utils/test-server-utilities.js'
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
        //retrieves the webscraper's token from the properties file
        setEnvProperty("WEBSCRAPER_TOKEN", req.body.webscraperToken).then(() => {
            //response
            res.send({
                "success": "true"
            });
        }).catch(e => {
            //response
            res.send({
                "success": "false",
                "reason": error
            });
        });
    } else {
        //response
        res.send({
            "success": "false",
            "reason": validateConfigResult + " cannot be empty"
        });
    }

});

export default router;