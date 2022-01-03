const https = require('https');

const createScrapingJob = function(sitemapId, webscraperToken) {
    return new Promise((resolve, reject) => {
        try {
            var body = JSON.stringify({
                "sitemap_id": sitemapId,
                "driver": "fast", // "fast" or "fulljs"
                "page_load_delay": 2000,
                "request_interval": 2000,
                "proxy": 0
            });

            // An object of options to indicate where to post to
            var post_options = {
                host: "api.webscraper.io",
                path: "/api/v1/scraping-job?api_token=" + webscraperToken,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(body)
                }
            };


            // Set up the request
            var post_req = https.request(post_options, function(res) {
                res.setEncoding('utf8');
                res.on('data', function(chunk) {
                    console.log('Response: ' + chunk);
                    var resObj = JSON.parse(chunk);

                    if (resObj.success) {
                        resolve(true);
                    } else {
                        reject("Failure in scraping job creation");
                    }
                });
                res.on('error', function(e) {
                    reject("Failure in scraping job creation");
                });

            });

            // post the data
            post_req.write(body);
            post_req.end();
        }
        catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    createScrapingJob
};