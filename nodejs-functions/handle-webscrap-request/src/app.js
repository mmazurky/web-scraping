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
 * Sends a scraping request
 * @param {string} url 
 * @param {string} selector 
 * @param {string} webscraperToken 
 * @returns 
 */
function sendScrapingRequest(url, selector, webscraperToken) {
    return new WebscraperController().handleWebscrapRequest(url, selector, webscraperToken);
}

export {
    awsLambdaHandler,
    sendScrapingRequest
}