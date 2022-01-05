//initializes the libraries
const awsLambdaUtilities = require('../lib/aws-lambda-utilities');
const webscraper = require('../webscraper/index')

/**
 * Handler method used by AWS Lambda
 * @param {string} event 
 * @param {*} context 
 */
const handler = function (event, context, callback) {
    console.log('Received event:', event);

    try {
        // webscraper's token (configured as environment variable)
        let webscraperToken = process.env.WEBSCRAPER_TOKEN;

        // creates the scraping request
        webscraper.createScrapingJob(event.sitemapId, webscraperToken).then(() => {
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