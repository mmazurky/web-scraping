const https = require('https');
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

// webscraper's token (configured as environment variable)
const webscraperToken = process.env.WEBSCRAPER_TOKEN;

exports.handler = function(event, context) {
    try {
        handleWebscrapResponse(event).then(() => {
            console.log("Finished with success!");
            context.succeed();
        }).catch(e => {
            console.log("An exception has occurred: " + e);
            context.fail(e);
        })
    } catch (e) {
        console.log("An exception has occurred: " + e);
        context.fail(e);
    }
}

function handleWebscrapResponse(event) {
    return new Promise((resolve, reject) => {
        
        try {
            // retrieves the scraping job id received in the response
            let scrapingJobId = retrieveScrapingConfigValue(event, "scrapingjob_id");
            // retrieves the sitemap id received in the response
            let sitemapId = retrieveScrapingConfigValue(event, "sitemap_id");

            // retrieves the scraping result
            return retrieveScrapingResult(scrapingJobId).then(scrapingResult => {
                // saves the scraping result to DB
                callLambdaFunction('save-scraping-result-to-db', scrapingResult).then(() => {
                    // deletes the scraping request
                    callLambdaFunction('delete-scraping-request', { "scrapingJobId": scrapingJobId, "sitemapId": sitemapId }).then(() => {
                        resolve(true);
                    }).catch(e => { reject(e); })
                }).catch(e => { reject(e); })
            }).catch(e => { reject(e); })
        } catch (e) {
            reject(e);
        }
    });
}

function retrieveScrapingConfigValue(event, configName) {
    let configValue = "";

    let responseBody = Buffer.from(event.body, 'base64').toString().split("&");

    for (var i = 0; i < responseBody.length; i++) {
        if (responseBody[i].includes(configName)) {
            configValue = responseBody[i].replace(configName + "=", "");
            break;
        }
    }

    return configValue;
}

function retrieveScrapingResult(scrapingJobId) {
    return new Promise((resolve, reject) => {
        // mounts the URL to get the scraping result
        let scrapingFileURL = "https://api.webscraper.io/api/v1/scraping-job/" + scrapingJobId + "/json?api_token=" + webscraperToken;

        https.get(scrapingFileURL, (response) => {
            const buffers = [];
            response.on('error', (err) => { reject(err); });
            response.on('data', (buffer) => {
                buffers.push(buffer);
            });
            response.on('end', () => {
                resolve(buffers.toString());
            });
        });
    });
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
