const https = require('https');
const propertiesUtilities = require('../lib/properties-utilities');
const saveScrapingResultToDb = require('save-scraping-result-to-db');
const deleteScrapingRequest = require('delete-scraping-request');

function retrieveScrapingResult (scrapingJobId, webscraperToken) {
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

const handleWebscrapResponse = function(event) {
    return new Promise((resolve, reject) => {
        try {
            // retrieves the scraping job id received in the response
            let scrapingJobId = event.scrapingjob_id;
            // retrieves the sitemap id received in the response
            let sitemapId = event.sitemap_id;
            // retrieves the webscraper from the properties file
            let webscraperToken = propertiesUtilities.getProperty("webscraper", "token");
            
            // retrieves the scraping result
            console.log("----------------- RETRIEVING THE SCRAP RESULT FROM WEBSCRAPER -----------------");
            return retrieveScrapingResult(scrapingJobId,webscraperToken).then(scrapingResult => {
                console.log("-Result retrieved with success!");
                let dbClient = propertiesUtilities.getProperty("database", "client");
                let dbName = propertiesUtilities.getProperty("database", "name");
                let dbHost = propertiesUtilities.getProperty("database", "host");
                let dbUser = propertiesUtilities.getProperty("database", "username");
                let dbPassword = propertiesUtilities.getProperty("database", "password");

                // saves the scraping result to DB
                console.log("----------------- SAVING RESULT TO THE DATABASE -----------------");
                saveScrapingResultToDb.database.saveToDB(scrapingResult, dbHost, dbUser, dbPassword, dbName, dbClient).then(() => {
                    console.log("-Inserted in DB with success!");
                    // deletes the scraping request
                    console.log("----------------- DELETING THE SCRAP REQUEST FROM WEBSCRAPER -----------------");
                    deleteScrapingRequest.webscraper.deleteScrapingRequest(scrapingJobId, sitemapId, webscraperToken).then(() => {
                        console.log("-Scrap Request deleted with success!")
                        resolve(true);
                    }).catch(e => { reject(e); });
                }).catch(e => { reject(e); });
            }).catch(e => { reject(e); });
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    handleWebscrapResponse
}