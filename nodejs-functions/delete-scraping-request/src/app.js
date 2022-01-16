import { AwsLambdaController } from './controllers/aws-lambda-controller.js';
import { WebscraperController } from './controllers/webscraper-controller.js';

/**
 * Handler for AWS Lambda
 * @param {*} event 
 * @param {*} context 
 * @returns 
 */
function awsLambdaHandler(event, context) {
    return new AwsLambdaController().handler(event, context);
}

/**
 * Deletes a scraping request in Webscraper
 * @param {number} scrapingJobId 
 * @param {number} sitemapId 
 * @param {string} webscraperToken 
 * @returns 
 */
function deleteScraping(scrapingJobId, sitemapId, webscraperToken) {
    return new WebscraperController().deleteScraping(scrapingJobId, sitemapId, webscraperToken);
}

export {
    awsLambdaHandler,
    deleteScraping
}