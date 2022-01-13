import { AwsLambdaController } from './controllers/aws-lambda-controller.js';
import { WebscraperController } from './controllers/webscraper-controller.js';

function awsLambdaHandler(event, context) {
    return new AwsLambdaController().handler(event, context);
}

function createSitemap(url, selector, webscraperToken) {
    return new WebscraperController().createSitemap(url, selector, webscraperToken);
}

export {
    awsLambdaHandler,
    createSitemap
}