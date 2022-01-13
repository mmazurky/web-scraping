//initializes the libraries
import https from 'https';
import { getEnvProperty } from '../utils/properties-utilities.js';
import { saveScrapingResultToDB } from 'save-scraping-result-to-db';
import { deleteScraping } from 'delete-scraping-request';

class WebscraperController {
    /**
     * Retrieves the scraping result from webscraper
     * @param {number} scrapingJobId 
     * @param {string} webscraperToken 
     * @returns 
     */
    retrieveScrapingResult(scrapingJobId, webscraperToken) {
        return new Promise((resolve, reject) => {
            // mounts the URL to get the scraping result
            let scrapingFileURL = "https://api.webscraper.io/api/v1/scraping-job/" + scrapingJobId + "/json?api_token=" + webscraperToken;
            https.get(scrapingFileURL, (response) => {
                const buffers = [];
                response.on('error', (err) => {
                    reject(err);
                });
                response.on('data', (buffer) => {
                    buffers.push(buffer);
                });
                response.on('end', () => {
                    resolve(buffers.toString());
                });
            });
        });
    };

    /**
     * Handles the Scrap response
     * @param {*} event 
     * @returns 
     */
    handleWebscrapResponse = function (event) {
        return new Promise((resolve, reject) => {
            try {
                // retrieves the scraping job id received in the response
                let scrapingJobId = event.scrapingjob_id;
                // retrieves the sitemap id received in the response
                let sitemapId = event.sitemap_id;
                // retrieves the webscraper from the properties file
                let webscraperToken = getEnvProperty("WEBSCRAPER_TOKEN");

                // retrieves the scraping result
                console.log("----------------- RETRIEVING THE SCRAP RESULT FROM WEBSCRAPER -----------------");
                return retrieveScrapingResult(scrapingJobId, webscraperToken).then(scrapingResult => {
                    console.log("-Result retrieved with success!");

                    // saves the scraping result to DB
                    console.log("----------------- SAVING RESULT TO THE DATABASE -----------------");
                    saveScrapingResultToDB(scrapingResult).then(() => {
                        console.log("-Inserted in DB with success!");
                        // deletes the scraping request
                        console.log("----------------- DELETING THE SCRAP REQUEST FROM WEBSCRAPER -----------------");
                        deleteScraping(scrapingJobId, sitemapId, webscraperToken).then(() => {
                            console.log("-Scrap Request deleted with success!")
                            resolve(true);
                        }).catch(e => { reject(e); });
                    }).catch(e => { reject(e); });
                }).catch(e => {
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

}


export {
    WebscraperController
}