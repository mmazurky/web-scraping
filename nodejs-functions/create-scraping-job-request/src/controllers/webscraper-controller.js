import axios from 'axios';
import * as WebscraperConstants from '../constants/webscraper-constants.js';

class WebscraperController {
    /**
     * Creates a scraping job in webscraper
     * @param {number} sitemapId 
     * @param {string} webscraperToken 
     * @returns 
     */
    createScrapingJob(sitemapId, webscraperToken) {
        return new Promise((resolve, reject) => {
            try {
                //validates the fields
                this.validateCreateScrapingJobRequest(sitemapId, webscraperToken);

                //mounts the body
                let body = {
                    "sitemap_id": sitemapId,
                    "driver": "fast", // "fast" or "fulljs"
                    "page_load_delay": 2000,
                    "request_interval": 2000,
                    "proxy": 0
                };

                //sends the request
                axios.post(WebscraperConstants.WEBSCRAPER_HOST + WebscraperConstants.CREATE_SCRAPING_JOB_PATH + "?api_token=" +  webscraperToken, body).then(res => {
                    //if the scraping job id is present in the response, it was created with success
                    if (res && res.data && res.data.data && res.data.data.id) {
                        resolve(res.data.data.id);
                    } else {
                        reject(res.data);
                    }
                }).catch(e => {
                    //status code different than 200
                    reject(e.response.data);
                })
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Validates the request to create a scraping job
     * @param {number} sitemapId 
     * @param {string} webscraperToken 
     */
    validateCreateScrapingJobRequest(sitemapId, webscraperToken) {
        if (!sitemapId || !webscraperToken) {
            throw new Error(WebscraperConstants.INVALID_CREATE_SCRAPING_JOB_REQUEST_MESSAGE);
        }

        return true;
    }
}

export {
    WebscraperController
};