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

module.exports = {
    executeCallback
};