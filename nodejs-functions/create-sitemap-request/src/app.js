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
 * Creates a sitemap in Webscraper
 * @param {string} url 
 * @param {string} selector 
 * @param {string} webscraperToken 
 * @returns 
 */
function createSitemap(url, selector, webscraperToken) {
    return new WebscraperController().createSitemap(url, selector, webscraperToken);
}

export {
    awsLambdaHandler,
    createSitemap
}