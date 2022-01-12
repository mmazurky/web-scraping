import { AwsLambdaController } from './controllers/aws-lambda-controller.js';
import { WebscraperController } from './controllers/webscraper-controller.js';

function awsLambdaHandler(event, context) {
    return new AwsLambdaController().handler(event, context);
}

function createScrapingJob(sitemapId, webscraperToken) {
    return new WebscraperController().createScrapingJob(sitemapId, webscraperToken);
}

module.exports = {
    awsLambdaHandler,
    createScrapingJob
}