class AwsLambdaUtilities {
    /**
     * Execute the callback for the AWS Lambda function
     * @param {error} error 
     * @param {*} callback 
     */
    static executeCallback(error, callback) {
        // mounts the JSON response
        let response = {
            status: !error ? 200 : 400,
            success: !error
        };

        // executes the callback
        callback(null, JSON.stringify(response));
    };
    
    /**
     * Retrieves the scraping config value
     * received from webscraper in AWS Lambda
     * @param {*} event 
     * @param {string} configName 
     * @returns 
     */
    static retrieveScrapingConfigValue(event, configName) {
        let configValue = "";

        //gets the response body (splitted by &)
        let responseBody = Buffer.from(event.body, 'base64').toString().split("&");

        for (var i = 0; i < responseBody.length; i++) {
            if (responseBody[i].includes(configName)) {
                //gets the config value
                configValue = responseBody[i].replace(configName + "=", "");
                break;
            }
        }

        return configValue;
    };

    /**
     * Executes the success callback
     * @param {*} context 
     */
    static executeSuccessCallback(context) {
        console.log("Finished with success!");
        // response for AWS Lambda
        context.succeed();
    };

    /**
     * Executes the error callback
     * @param {*} context 
     * @param {error} error 
     */
    static executeErrorCallback(context, error) {
        console.log("An exception has occurred: " + error);
        // response for AWS Lambda
        context.fail(error);
    };
}

export const executeCallback = AwsLambdaUtilities.executeCallback;
export const retrieveScrapingConfigValue = AwsLambdaUtilities.retrieveScrapingConfigValue;
export const executeSuccessCallback = AwsLambdaUtilities.executeSuccessCallback;
export const executeErrorCallback = AwsLambdaUtilities.executeErrorCallback;