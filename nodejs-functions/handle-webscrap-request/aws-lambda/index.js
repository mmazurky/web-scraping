
const awsLambdaUtilities = require('../lib/aws-lambda-utilities');

const handler = function(event, context) {
    try {
        var body = awsLambdaUtilities.getBodyJson(event);
        var url = event.url && event.url != null ? event.url : body != null && body.url ? body.url : null;
        var name = event.name && event.name != null ? event.name : body != null && body.name ? body.name : null;
        var selector = event.selector && event.selector != null ? event.selector : body != null && body.selector ? body.selector : null;

        handleWebscrapRequest(url, name, selector).then(() => {
            console.log("Finished with success!");
            context.succeed();
        }).catch(error => {
            console.log("An exception has occurred: " + error);
            context.fail(error);    
        });
    }
    catch (error) {
        console.log("An exception has occurred: " + error);
        context.fail(error);
    }
};

function handleWebscrapRequest(url, name, selector) {
    return new Promise((resolve, reject) => {
        try {
            awsLambdaUtilities.callLambdaFunction('create-sitemap-request', { "name": name, "url": url, "selector" : selector }).then(payload => {
                awsLambdaUtilities.callLambdaFunction('create-scraping-job-request', { "sitemapId": awsLambdaUtilities.getJsonPayload(payload).sitemapId }).then(() => {
                    resolve(true);
                }).catch(e => reject(e));
            }).catch(e => reject(e));
        }
        catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    handler
}