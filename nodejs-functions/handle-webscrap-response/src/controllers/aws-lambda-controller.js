//initializes the libraries
import { executeSuccessCallback, executeErrorCallback } from "../utils/aws-lambda-utilities.js";
import { WebscraperController } from "./webscraper-controller.js";

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
            handleWebscrapResponse(event).then(() => {
                executeSuccessCallback(context);
            }).catch(e => {
                executeErrorCallback(context, e);
            })
        } catch (e) {
            executeErrorCallback(context, e);
        }
    };

    /**
     * Handles the Scrap response
     * @param {*} event 
     * @returns 
     */
    handleWebscrapResponse(event) {
        return new Promise((resolve, reject) => {
            try {
                // instantiates the controller
                let webscraperController = new WebscraperController();

                // retrieves the scraping job id received in the response
                let scrapingJobId = awsLambdaUtilities.retrieveScrapingConfigValue(event, "scrapingjob_id");
                // retrieves the sitemap id received in the response
                let sitemapId = awsLambdaUtilities.retrieveScrapingConfigValue(event, "sitemap_id");
                // retrieves the webscraper token received in the response
                let webscraperToken = awsLambdaUtilities.retrieveScrapingConfigValue(event, "webscraper_token");

                // retrieves the scraping result
                return webscraperController.retrieveScrapingResult(scrapingJobId, webscraperToken).then(scrapingResult => {
                    // saves the scraping result to DB
                    this.callLambdaFunction('save-scraping-result-to-db', scrapingResult).then(() => {
                        // mounts the delete scraping's request
                        let deleteScrapingRequest = {
                            "scrapingJobId": scrapingJobId,
                            "sitemapId": sitemapId,
                            //retrieves the webscraper token from environment
                            "webscraperToken": getEnvProperty("WEBSCRAPER_TOKEN")
                        };

                        // deletes the scraping request
                        this.callLambdaFunction('delete-scraping-request', deleteScrapingRequest).then(() => {
                            resolve(true);
                        }).catch(e => {
                            reject(e);
                        })
                    }).catch(e => {
                        reject(e);
                    })
                }).catch(e => {
                    reject(e);
                })
            } catch (e) {
                reject(e);
            }
        });
    }

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