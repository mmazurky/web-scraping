import { AwsLambdaController } from './controllers/aws-lambda-controller.js';
import { DatabaseController } from './controllers/database-controller.js';

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
 * Saves a scraping result to DB
 * @param {*} scrapingData 
 * @returns 
 */
function saveScrapingResultToDB(scrapingData) {
    return new DatabaseController().saveScrapingResultToDB(scrapingData);
}

export {
    awsLambdaHandler,
    saveScrapingResultToDB
}