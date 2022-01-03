const executeCallback = function executeCallback(error, callback, sitemapId) {
    let response = {
        status: !error ? 200 : 400,
        success: !error,
        sitemapId: sitemapId
    };

    // executes the callback
    callback(null, JSON.stringify(response));
};

module.exports = {
    executeCallback
};