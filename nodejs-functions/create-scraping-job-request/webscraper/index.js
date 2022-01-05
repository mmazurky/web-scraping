//initializes the libraries
const https = require('https');

/**
 * Creates a scraping job in webscraper
 * @param {number} sitemapId 
 * @param {string} webscraperToken 
 * @returns 
 */
const createScrapingJob = function (sitemapId, webscraperToken) {
    return new Promise((resolve, reject) => {
        try {
            //sets up the request body
            var body = JSON.stringify({
                "sitemap_id": sitemapId,
                "driver": "fast", // "fast" or "fulljs"
                "page_load_delay": 2000,
                "request_interval": 2000,
                "proxy": 0
            });

            //sets up the http options
            var post_options = {
                host: "api.webscraper.io",
                path: "/api/v1/scraping-job?api_token=" + webscraperToken,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(body)
                }
            };

            //sends the request
            var post_req = https.request(post_options, function (res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    var resObj = JSON.parse(chunk);

                    //if the scraping job id is present in the response, it was created with success
                    if (resObj.data && resObj.data.id) {
                        resolve(resObj.data.id);
                    } else {
                        reject(chunk);
                    }
                });
                res.on('error', function (e) {
                    reject(e);
                });

            });

            // ost the data
            post_req.write(body);
            post_req.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    createScrapingJob
};