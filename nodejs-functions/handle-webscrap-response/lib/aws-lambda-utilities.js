const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
const https = require('https');
const http = require('http');

const executeCallback = function (error, callback) {
    let response = {
        status: !error ? 200 : 400,
        success: !error
    };

    // executes the callback
    callback(null, JSON.stringify(response));
};

const getBodyJson = function (event) {
    try {
        return event.body && event.body != null ? JSON.parse(event.body) : null;
    } catch (e) {
        console.log("Exception: " + e);
    }
};

const getJsonPayload = function (data) {
    let hasPayload = data && data.Payload;
    return hasPayload ? JSON.parse(data.Payload) : null;
};

const callLambdaFunction = function (functionName, payload) {
    // calls another lambda function
    return new Promise((resolve, reject) => {
        var params = {
            FunctionName: functionName,
            InvocationType: 'RequestResponse',
            LogType: 'Tail',
            Payload: JSON.stringify(payload)
        };


        lambda.invoke(params, function (err, data) {
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
};

const retrieveScrapingConfigValue = function (event, configName) {
    let configValue = "";

    let responseBody = Buffer.from(event.body, 'base64').toString().split("&");

    for (var i = 0; i < responseBody.length; i++) {
        if (responseBody[i].includes(configName)) {
            configValue = responseBody[i].replace(configName + "=", "");
            break;
        }
    }

    return configValue;
};

module.exports = {
    executeCallback,
    getBodyJson,
    getJsonPayload,
    callLambdaFunction,
    retrieveScrapingConfigValue
};