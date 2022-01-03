const awsLambdaUtilities = require('../lib/aws-lambda-utilities');
const webscraper = require('../webscraper/index')

const handler = function(event, context, callback) {
    console.log('Received event:', event);

    try {
        // creates the scraping request
        webscraper.createScrapingJob(event.sitemapId, process.env.WEBSCRAPER_TOKEN).then(() => {
            console.log("Finished with success!");
            // returns the request status
            awsLambdaUtilities.executeCallback(null, callback);
        }).catch(error => {
            console.log("An exception has occurred: " + error);
            // returns the request status
            awsLambdaUtilities.executeCallback(error, callback);
        });
    }
    catch (error) {
        console.log("An exception has occurred: " + error);
        // returns the request status
        awsLambdaUtilities.executeCallback(error, callback);
    }
};

module.exports = {
    handler
}