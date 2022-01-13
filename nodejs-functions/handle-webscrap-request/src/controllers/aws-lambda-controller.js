import AWS from 'aws-sdk';
import { getBodyJson, getJsonPayload, executeSuccessCallback, executeErrorCallback } from "../utils/aws-lambda-utilities.js"

class AwsLambdaController {
    constructor() {
        this.lambda = new AWS.Lambda();
    }

    /**
     * Handler method used by AWS Lambda
     * @param {string} event 
     * @param {*} context 
     */
    handler(event, context) {
        try {
            //retrieves the request's body in JSON format
            let body = getBodyJson(event);

            // mounts the create sitemap's request
            let createSitemapRequest = {
                //retrieves the url value (tries to get in the request's body or in request's parameters)
                "url": event.url && event.url != null ? event.url : body != null && body.url ? body.url : null,
                //retrieves the selector value (tries to get in the request's body or in request's parameters)
                "selector": event.selector && event.selector != null ? event.selector : body != null && body.selector ? body.selector : null
            };

            //calls the lambda function to create the sitemap
            this.callLambdaFunction('create-sitemap-request', createSitemapRequest).then(payload => {
                //calls the lambda function to create the scraping job
                this.callLambdaFunction('create-scraping-job-request', { "sitemapId": getJsonPayload(payload).sitemapId }).then(() => {
                    //executes the success callback
                    executeSuccessCallback(context);
                }).catch(error => {
                    //executes the error callback
                    executeErrorCallback(context, error);
                });
            }).catch(error => {
                //executes the error callback
                executeErrorCallback(context, error);
            });
        } catch (error) {
            //executes the error callback
            executeErrorCallback(context, error);
        }
    };

    /**
     * Calls another AWS Lambda function
     * @param {string} functionName 
     * @param {string} payload 
     * @returns 
     */
    callLambdaFunction(functionName, payload) {
        return new Promise((resolve, reject) => {
            //defines the parameters
            var params = {
                FunctionName: functionName,
                InvocationType: 'RequestResponse',
                LogType: 'Tail',
                Payload: JSON.stringify(payload)
            };

            //invokes the function
            this.lambda.invoke(params, function (err, data) {
                //checks if the payload is present
                let hasPayload = data && data.Payload;
                //gets the JSON Payload
                let jsonPayload = hasPayload ? JSON.parse(data.Payload) : null;

                let success = hasPayload ? JSON.parse(jsonPayload).success : false;

                if (!success || err) {
                    console.log("Error calling the Lambda Function " + functionName + ": ", data ? data : err);
                    reject(functionName);
                } else {
                    resolve(data);
                }
            });
        });
    };
}

export {
    AwsLambdaController
};