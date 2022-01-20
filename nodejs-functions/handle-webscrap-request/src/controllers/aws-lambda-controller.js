import { getEnvProperty } from "../utils/properties-utilities.js";
import { AWSLambdaUtilities } from "../utils/aws-lambda-utilities.js"
import { WebscraperUtilities } from "../utils/webscraper-utilities.js"

class AwsLambdaController {
    /**
     * Handler method used by AWS Lambda
     * @param {string} event 
     * @param {*} context 
     */
    async handler(event, context) {
        try {
            // validates the webscraper token in environment
            WebscraperUtilities.validateWebscraperToken();

            //calls the lambda function to create the sitemap
            let createSitemapResult = AWSLambdaUtilities.callLambdaSyncFunction('create-sitemap-request', {
                //retrieves the url value (tries to get in the request's body or in request's parameters)
                "url": event.url ? event.url : null,
                //retrieves the selector value (tries to get in the request's body or in request's parameters)
                "selector": event.selector ? event.selector : null,
                //retrieves the webscraper token from environment
                "webscraperToken": getEnvProperty("WEBSCRAPER_TOKEN")
            });

            //calls the lambda function to create the scraping job
            AWSLambdaUtilities.callLambdaSyncFunction('create-scraping-job-request', {
                "sitemapId": createSitemapResult.sitemapId,
                //retrieves the webscraper token from environment
                "webscraperToken": getEnvProperty("WEBSCRAPER_TOKEN")
            });

            //executes the success callback
            return AWSLambdaUtilities.retrieveLambdaSuccessResponse();
        } catch (error) {
            //executes the error callback
            return AWSLambdaUtilities.retrieveLambdaErrorResponse(error);
        }
    };
}

export {
    AwsLambdaController
};