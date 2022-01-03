const awsLambdaUtilities = require('../lib/aws-lambda-utilities');
const webscraper = require('../webscraper/index')

const handler = function(event, context, callback) {
    console.log('Received event:', event);

    try {
        // deletes the scraping request
        webscraper.createSitemapRequest(event.url, event.name, event.selector, process.env.WEBSCRAPER_TOKEN).then(sitemapId => {
            console.log("Finished with success!");
            // returns the request status
            awsLambdaUtilities.executeCallback(null, callback, sitemapId);
        }).catch(error => {
            console.log("An exception has occurred: " + error);
            // returns the request status
            awsLambdaUtilities.executeCallback(error, callback, null);
        });
    }
    catch (error) {
        console.log("An exception has occurred: " + error);
        // returns the request status
        awsLambdaUtilities.executeCallback(error, callback, null);
    }
};

module.exports = {
    handler
}