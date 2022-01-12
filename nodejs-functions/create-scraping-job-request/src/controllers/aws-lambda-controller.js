import { WebscraperController } from './webscraper-controller.js';
import { executeCallback } from "../utils/aws-lambda-utilities.js"
import { getEnvProperty } from '../utils/properties-utilities.js'

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

            // webscraper's token (configured as environment variable)
            let webscraperToken = getEnvProperty('WEBSCRAPER_TOKEN');

            // creates the scraping request
            webscraperController.createScrapingJob(event.sitemapId, webscraperToken).then(() => {
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