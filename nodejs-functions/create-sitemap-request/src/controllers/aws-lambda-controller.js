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
            let webscraper = new WebscraperController();
            // webscraper's token (configured as environment variable)
            let webscraperToken = getEnvProperty('WEBSCRAPER_TOKEN');

            // deletes the scraping request)
            webscraper.createSitemap(event.url, event.selector, webscraperToken).then(sitemapId => {
                console.log("Finished with success!");
                // returns the request status
                executeCallback(null, callback, sitemapId);
            }).catch(error => {
                console.log("An exception has occurred: " + error);
                // returns the request status
                executeCallback(error, callback, null);
            });
        } catch (error) {
            console.log("An exception has occurred: " + error);
            // returns the request status
            executeCallback(error, callback, null);
        }
    };
}

export {
    AwsLambdaController
};