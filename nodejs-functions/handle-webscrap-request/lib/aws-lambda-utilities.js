//initializes the libraries
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

/**
 * Execute the callback for the AWS Lambda function
 * @param {error} error 
 * @param {*} callback 
 */
const executeCallback = function (error, callback) {
    // mounts the JSON response
    let response = {
        status: !error ? 200 : 400,
        success: !error
    };

    // executes the callback
    callback(null, JSON.stringify(response));
};

/**
 * Gets the body's request in JSON format
 * @param {*} event 
 * @returns 
 */
const getBodyJson = function (event) {
    try {
        return event.body && event.body != null ? JSON.parse(event.body) : null;
    } catch (e) {
        console.log("Exception: " + e);
    }
};

/**
 * Gets the JSON Payload
 * @param {*} data 
 * @returns 
 */
const getJsonPayload = function (data) {
    let hasPayload = data && data.Payload;
    return hasPayload ? JSON.parse(data.Payload) : null;
};

/**
 * Calls another AWS Lambda function
 * @param {string} functionName 
 * @param {string} payload 
 * @returns 
 */
const callLambdaFunction = function (functionName, payload) {
    return new Promise((resolve, reject) => {
        //defines the parameters
        var params = {
            FunctionName: functionName,
            InvocationType: 'RequestResponse',
            LogType: 'Tail',
            Payload: JSON.stringify(payload)
        };

        //invokes the function
        lambda.invoke(params, function (err, data) {
            //checks if the payload is present
            let hasPayload = data && data.Payload;
            //gets the JSON Payload
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
};

module.exports = {
    executeCallback,
    getBodyJson,
    getJsonPayload,
    callLambdaFunction
};