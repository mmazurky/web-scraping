const https = require('https');

const retrieveScrapingResult = function(scrapingJobId, webscraperToken) {
    return new Promise((resolve, reject) => {
        // mounts the URL to get the scraping result
        let scrapingFileURL = "https://api.webscraper.io/api/v1/scraping-job/" + scrapingJobId + "/json?api_token=" + webscraperToken;

        https.get(scrapingFileURL, (response) => {
            const buffers = [];
            response.on('error', (err) => { reject(err); });
            response.on('data', (buffer) => {
                buffers.push(buffer);
            });
            response.on('end', () => {
                resolve(buffers.toString());
            });
        });
    });
};

module.exports = {
    retrieveScrapingResult
}