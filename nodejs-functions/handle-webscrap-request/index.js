const https = require('https');
const http = require('http');
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

// webscraper's token (configured as environment variable)
const webscraperToken = process.env.WEBSCRAPER_TOKEN;

exports.handler = function(event, context) {
    try {
        handleWebscrapRequest(event).then(() => {
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

function handleWebscrapRequest(event) {
    return new Promise((resolve, reject) => {
        try {
            var body = getBodyJson(event);
            var url = event.url && event.url != null ? event.url : body != null && body.url ? body.url : null;
            var name = event.name && event.name != null ? event.name : body != null && body.name ? body.name : null;
            var selector = event.selector && event.selector != null ? event.selector : body != null && body.selector ? body.selector : null;

            callLambdaFunction('create-sitemap-request', { "name": name, "url": url, "selector" : selector }).then(payload => {
                callLambdaFunction('create-scraping-job-request', { "sitemapId": getJsonPayload(payload).sitemapId }).then(() => {
                    resolve(true);
                }).catch(e => reject(e));
            }).catch(e => reject(e));
        }
        catch (error) {
            reject(error);
        }
    });
}

function getBodyJson(event) {
    try {
        return event.body && event.body != null ? JSON.parse(event.body) : null;
    }
    catch (e) {
        console.log("Exception: " + e);
    }
}

function getJsonPayload(data) {
    let hasPayload = data && data.Payload;
    return hasPayload ? JSON.parse(data.Payload) : null;
}

function callLambdaFunction(functionName, payload) {
    // calls another lambda function
    return new Promise((resolve, reject) => {
        var params = {
            FunctionName: functionName,
            InvocationType: 'RequestResponse',
            LogType: 'Tail',
            Payload: JSON.stringify(payload)
        };


        lambda.invoke(params, function(err, data) {
            let hasPayload = data && data.Payload;
            let jsonPayload = hasPayload ? JSON.parse(data.Payload) : null;
            
            let success = hasPayload ? JSON.parse(jsonPayload).success : false;

            if (!success || err) {
                console.log("Error calling the Lambda Function " + functionName + ": ", data ? data : err);
                reject("Function:" + functionName);
            } else {
                resolve(data);
            }
        });
    });
}