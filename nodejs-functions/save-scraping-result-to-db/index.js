const awsLambda = require('./aws-lambda/index');
const database = require('./database/index');

module.exports = {
    awsLambdaHandler: function(event, context) {
        return awsLambda.handler(event, context);
    },
    saveToDB : function(scrapingData, dbHost, dbUser, dbPassword, dbName, dbClient) {
        return database.saveToDB(scrapingData, dbHost, dbUser, dbPassword, dbName, dbClient);
    }
};