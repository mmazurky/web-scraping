import { Router } from 'express';
import { sendScrapingRequest } from "../app.js";
import { getEnvProperty, setEnvProperty } from "../utils/properties-utilities.js";
import { generateScrapHtml } from '../utils/test-server-utilities.js'
let router = Router();

/**
 * http route: request test page
 */
router.get("/", (req, res) => {
    //shows generated scrap page
    res.send(generateScrapHtml());
});

/**
 * http route: performs the scrap request
 */
router.post("/", (req, res) => {
    //retrieves the webscraper's token from properties file
    let webscraperToken = getEnvProperty("WEBSCRAPER_TOKEN");

    //sends the scraping request
    sendScrapingRequest(req.body.url, req.body.selector, webscraperToken).then(scrapingJobId => {
        //response
        res.send({
            "success": "true",
            "scraping_job_id": scrapingJobId
        });
    }).catch(e => {
        console.log("An error has occurred: " + e);
        //response
        res.send({
            "success": "false",
            "reason": e
        });
    });

    //saves the selector value to properties file
    setEnvProperty("TEST_SERVER_SELECTOR", req.body.selector).then(() => {}).catch(e => {});
});

export default router;