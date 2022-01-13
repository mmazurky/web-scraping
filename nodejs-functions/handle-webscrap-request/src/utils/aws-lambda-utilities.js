class AwsLambdaUtilities {
    /**
     * Gets the body's request in JSON format
     * @param {*} event 
     * @returns 
     */
    static getBodyJson(event) {
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
    static getJsonPayload(data) {
        let hasPayload = data && data.Payload;
        return hasPayload ? JSON.parse(data.Payload) : null;
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

export const getBodyJson = AwsLambdaUtilities.getBodyJson;
export const getJsonPayload = AwsLambdaUtilities.getJsonPayload;
export const executeSuccessCallback = AwsLambdaUtilities.executeSuccessCallback;
export const executeErrorCallback = AwsLambdaUtilities.executeErrorCallback;