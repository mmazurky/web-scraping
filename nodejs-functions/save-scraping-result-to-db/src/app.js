import { AwsLambdaController } from './controllers/aws-lambda-controller.js';
import { DatabaseController } from './controllers/database-controller.js';

function awsLambdaHandler(event, context) {
    return new AwsLambdaController().handler(event, context);
}

function saveScrapingResultToDB(scrapingData, dbHost, dbUser, dbPassword, dbName, dbClient) {
    return new DatabaseController().saveScrapingResultToDB(scrapingData, dbHost, dbUser, dbPassword, dbName, dbClient);
}

module.exports = {
    awsLambdaHandler,
    saveScrapingResultToDB
}