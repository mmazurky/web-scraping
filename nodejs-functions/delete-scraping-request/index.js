const https = require('https');

// webscraper's token (configured as environment variable)
const webscraperToken = process.env.WEBSCRAPER_TOKEN;

exports.handler = function(event, context, callback) {
    console.log('Received event:', event);

    try {
        // deletes the scraping request
        deleteScrapingRequest(event).then(() => {
            console.log("Finished with success!");
            // returns the request status
            executeCallback(null, callback);
        }).catch(error => {
            console.log("An exception has occurred: " + error.message ? error.message : error);
            // returns the request status
            executeCallback(error, callback);
        });
    }
    catch (error) {
        console.log("An error occurred: " + error);
        // returns the request status
        executeCallback(error, callback);
    }
};

function deleteScrapingRequest(event) {
    return new Promise((resolve, reject) => {
        let scrapingJobDeletePath = "/api/v1/scraping-job/" + event.scrapingJobId + "?api_token=" + webscraperToken;
        let sitemapDeletePath = "/api/v1/sitemap/" + event.sitemapId + "?api_token=" + webscraperToken;
    
        // deletes the scraping job
        return callDeleteAPI(scrapingJobDeletePath).then(function() {
            // deletes the sitemap
            callDeleteAPI(sitemapDeletePath).then(() => {
                resolve(true);
            }).catch(function(e) {reject(e);});
        }).catch(function(e) {reject(e);});
    });
}


function executeCallback(error, callback) {
    let response = {
        status: !error ? 200 : 400,
        success: !error
    };

    // executes the callback
    callback(error.message, JSON.stringify(response));
}

function callDeleteAPI(pathConfig) {
    var delete_options = {
        host: "api.webscraper.io",
        path: pathConfig,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    // sends the delete request via webscrapper API
    return new Promise((resolve, reject) => {
        var delete_req = https.request(delete_options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                let result = JSON.parse(chunk);

                if (result.success) {
                    resolve(chunk);
                } else {
                    console.log("Error in delete operation", chunk);
                    reject(chunk);
                }
            });
            res.on('error', function(e) {
                console.log("Got error in " + pathConfig, e.message);
                reject(e);
            });
        });

        // delete the data
        delete_req.end();
    });
}
