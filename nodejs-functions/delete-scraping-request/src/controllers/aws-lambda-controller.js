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
            let webscraperController = new WebscraperController();

            // deletes the scraping request
            let deleteScrapingResult = await webscraperController.deleteScraping(event.scrapingJobId, event.sitemapId, event.webscraperToken).then(() => {
                // returns the request response
                 return retrieveLambdaSuccessResponse();
            }).catch(error => {
                // returns the request response
                return retrieveLambdaErrorResponse(error);
            });

            return deleteScrapingResult;
        } catch (error) {
            // returns the request response
            return retrieveLambdaErrorResponse(error);
        }
    };
}

export {
    AwsLambdaController
};