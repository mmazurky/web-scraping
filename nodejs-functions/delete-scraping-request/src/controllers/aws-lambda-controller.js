import { WebscraperController } from './webscraper-controller.js';
import { executeCallback } from "../utils/aws-lambda-utilities.js"

class AwsLambdaController {
    /**
     * Handler method used by AWS Lambda
     * @param {string} event 
     * @param {*} context 
     */
    handler(event, context, callback) {
        console.log('Received event:', event);

        try {
            //instantiates the controller
            let webscraperController = new WebscraperController();

            // deletes the scraping request
            webscraperController.deleteScraping(event.scrapingJobId, event.sitemapId, event.webscraperToken).then(() => {
                console.log("Finished with success!");
                // returns the request status
                executeCallback(null, callback);
            }).catch(error => {
                console.log("An exception has occurred: " + error);
                // returns the request status
                executeCallback(error, callback);
            });
        } catch (error) {
            console.log("An exception has occurred: " + error);
            // returns the request status
            executeCallback(error, callback);
        }
    };
}

export {
    AwsLambdaController
};