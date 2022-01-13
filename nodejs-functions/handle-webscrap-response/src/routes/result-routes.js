import { Router } from 'express';
import { handleWebscrapResponse } from '../app.js'
let router = Router();

/**
 * http route: receives the scrap result from webscraper
 */
router.post("/", (req, res) => {
    console.log("> Webscraper finished the scrap! " + JSON.stringify(req.body));
    //answers to webscraper
    res.send({
        "success": "true"
    });

    // handles the response
    handleWebscrapResponse(req.body).then(() => {
        console.log("----------------- SCRAPING PROCESS FINISHED WITH SUCCESS -----------------");
    }).catch(e => {
        console.log("-An error has occurred: " + e);
    });
});

export default router;