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

    static test() {
        console.log("aaaaaa");
    }
}

export default { executeCallback, test };