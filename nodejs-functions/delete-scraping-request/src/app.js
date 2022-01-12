import { AwsLambdaController } from './controllers/aws-lambda-controller.js';
import { WebscraperController } from './controllers/webscraper-controller.js';

function awsLambdaHandler(event, context) {
    return new AwsLambdaController().handler(event, context);
}

function deleteScraping(scrapingJobId, sitemapId, webscraperToken) {
    return new WebscraperController().deleteScraping(scrapingJobId, sitemapId, webscraperToken);
}

module.exports = {
    awsLambdaHandler,
    deleteScraping
}