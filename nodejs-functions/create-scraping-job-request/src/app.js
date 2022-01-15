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
 * Creates a scraping job in Webscraper
 * @param {number} sitemapId 
 * @param {string} webscraperToken 
 * @returns 
 */
function createScrapingJob(sitemapId, webscraperToken) {
    return new WebscraperController().createScrapingJob(sitemapId, webscraperToken);
}

export {
    awsLambdaHandler,
    createScrapingJob
}