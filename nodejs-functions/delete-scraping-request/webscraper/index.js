const https = require('https');

const deleteScraping = function(scrapingJobId, sitemapId, webscraperToken) {
    return new Promise((resolve, reject) => {
        let scrapingJobDeletePath = "/api/v1/scraping-job/" + scrapingJobId + "?api_token=" + webscraperToken;
        let sitemapDeletePath = "/api/v1/sitemap/" + sitemapId + "?api_token=" + webscraperToken;
    
        // deletes the scraping job
        return callDeleteAPI(scrapingJobDeletePath).then(function() {
            // deletes the sitemap
            callDeleteAPI(sitemapDeletePath).then(() => {
                resolve(true);
            }).catch(function(e) {reject(e);});
        }).catch(function(e) {reject(e);});
    });
};

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
                    console.log("Got error in " + pathConfig, chunk);
                    reject(chunk);
                }
            });
            res.on('error', function(e) {
                console.log("Got error in " + pathConfig, e);
                reject(e);
            });
        });

        // delete the data
        delete_req.end();
    });
}

module.exports = {
    deleteScraping
}