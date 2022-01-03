const executeCallback = function(error, callback) {
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