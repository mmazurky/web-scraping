import { WebscraperController } from './webscraper-controller.js';
import { retrieveLambdaSuccessResponse, retrieveLambdaErrorResponse } from "../utils/aws-lambda-utilities.js";

class AwsLambdaController {
    /**
     * Handler method used by AWS Lambda
     * @param {object} event 
     * @param {*} context 
     */
    async handler(event, context) {
        try {
            //instantiates the controller
            let webscraper = new WebscraperController();

            // deletes the scraping request)
            let createSitemapResult = await webscraper.createSitemap(event.url, event.selector, event.webscraperToken).then(sitemapId => {
                // returns the request response
                return retrieveLambdaSuccessResponse(sitemapId);
            }).catch(error => {
                // returns the request response
                return retrieveLambdaErrorResponse(error);
            });

            return createSitemapResult;
        } catch (error) {
            // returns the request response
            return retrieveLambdaErrorResponse(error);
        }
    };
}

export {
    AwsLambdaController
};