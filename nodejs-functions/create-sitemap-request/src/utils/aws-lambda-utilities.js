class AwsLambdaUtilities {
    /**
     * Execute the callback for the AWS Lambda function
     * @param {error} error 
     * @param {*} callback 
     * @param {number} sitemapId 
     */
    static executeCallback(error, callback, sitemapId) {
        // mounts the JSON response
        let response = {
            status: !error ? 200 : 400,
            success: !error,
            sitemapId: sitemapId
        };
    
        // executes the callback
        callback(null, JSON.stringify(response));
    };
}

export const executeCallback = AwsLambdaUtilities.executeCallback;