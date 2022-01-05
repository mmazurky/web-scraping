//initializes the libraries
const awsLambdaUtilities = require('../lib/aws-lambda-utilities');

/**
 * Handler method used by AWS Lambda
 * @param {string} event 
 * @param {*} context 
 */
const handler = function (event, context) {
    try {
        //retrieves the request's body in JSON format
        var body = awsLambdaUtilities.getBodyJson(event);
        //retrieves the url value (tries to get in the request's body or in request's parameters)
        var url = event.url && event.url != null ? event.url : body != null && body.url ? body.url : null;
        //retrieves the selector value (tries to get in the request's body or in request's parameters)
        var selector = event.selector && event.selector != null ? event.selector : body != null && body.selector ? body.selector : null;

        //handles the webscrap request
        handleWebscrapRequest(url, selector).then(() => {
            console.log("Finished with success!");
            // response for AWS Lambda
            context.succeed();
        }).catch(error => {
            console.log("An exception has occurred: " + error);
            // response for AWS Lambda
            context.fail(error);
        });
    } catch (error) {
        console.log("An exception has occurred: " + error);
        // response for AWS Lambda
        context.fail(error);
    }
};

/**
 * Handles the Scrap request
 * @param {string} url 
 * @param {string} selector 
 * @returns 
 */
function handleWebscrapRequest(url, selector) {
    return new Promise((resolve, reject) => {
        try {
            //calls the lambda function to create the sitemap
            awsLambdaUtilities.callLambdaFunction('create-sitemap-request', {
                "url": url,
                "selector": selector
            }).then(payload => {
                //calls the lambda function to create the scraping job
                awsLambdaUtilities.callLambdaFunction('create-scraping-job-request', {
                    "sitemapId": awsLambdaUtilities.getJsonPayload(payload).sitemapId
                }).then(() => {
                    resolve(true);
                }).catch(e => reject(e));
            }).catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    handler
}