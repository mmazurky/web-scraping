const awsLambdaUtilities = require('../lib/aws-lambda-utilities');
const database = require('../database/index')

const handler = function(event, context, callback) {
    console.log('Received event:', event);

    try {
        // db config variables (configured as environment variables)
        const dbHost = process.env.DB_HOST;
        const dbUser = process.env.DB_USER;
        const dbPassword = process.env.DB_PASSWORD;
        const dbName = process.env.DB_NAME;
        const dbClient = process.env.DB_CLIENT;

        // saves the result to the DB
        database.saveToDB(event, dbHost, dbUser, dbPassword, dbName, dbClient).then(() => {
            console.log("Finished with success!");
            // returns the request status
            awsLambdaUtilities.executeCallback(null, callback);
        }).catch(error => {
            console.log("An exception has occurred: " + error);
            // returns the request status
            awsLambdaUtilities.executeCallback(error, callback);    
            
        });
    } catch (error) {
        console.log("An exception has occurred: " + error);
        // returns the request status
        awsLambdaUtilities.executeCallback(error, callback);
    }
};

module.exports = {
    handler
}