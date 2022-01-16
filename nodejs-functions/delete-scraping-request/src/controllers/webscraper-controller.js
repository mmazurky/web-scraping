import axios from 'axios';
import * as WebscraperConstants from '../constants/webscraper-constants.js';

class WebscraperController {
    /**
     * Deletes the scraping request from webscraper
     * @param {number} scrapingJobId 
     * @param {number} sitemapId 
     * @param {string} webscraperToken 
     * @returns 
     */
    deleteScraping(scrapingJobId, sitemapId, webscraperToken) {
        return new Promise((resolve, reject) => {
            try {
                //validates the fields
                this.validateDeleteScrapingRequest(scrapingJobId, sitemapId, webscraperToken);
    
                //default scraping job delete's path
                let scrapingJobDeletePath = WebscraperConstants.WEBSCRAPER_HOST + WebscraperConstants.DELETE_SCRAPING_JOB_PATH + "/" + scrapingJobId + "?api_token=" + webscraperToken;
                //default sitemap delete's path
                let sitemapDeletePath = WebscraperConstants.WEBSCRAPER_HOST + WebscraperConstants.DELETE_SITEMAP_PATH + "/" + sitemapId + "?api_token=" + webscraperToken;
    
                // deletes the scraping job
                this.callDeleteAPI(scrapingJobDeletePath).then(() => {
                    // deletes the sitemap
                    this.callDeleteAPI(sitemapDeletePath).then(() => {
                        resolve(true);
                    }).catch(function (e) {
                        reject(e);
                    });
                }).catch(function (e) {
                    reject(e);
                });
            } catch (e) {
                reject(e);                
            }
        });
    };

    /**
     * Calls the webscraper's DELETE API
     * @param {string} url 
     * @returns 
     */
    callDeleteAPI(url) {
        // sends the delete request via webscrapper API
        return new Promise((resolve, reject) => {
            axios.delete(url).then(res => {
                if (res.data.success) {
                    resolve(res.data.success);
                } else {
                    reject(res.data);
                }
            }).catch(e => {
                //status code different than 200
                reject(e.response.data);
            })
        });
    }

    /**
     * Validates the request to delete a scraping
     * @param {number} scrapingJobId 
     * @param {number} sitemapId 
     * @param {string} webscraperToken 
     */
    validateDeleteScrapingRequest(scrapingJobId, sitemapId, webscraperToken) {
        if (!scrapingJobId || !sitemapId || !webscraperToken) {
            throw new Error(WebscraperConstants.INVALID_DELETE_SCRAPING_REQUEST_MESSAGE);
        }

        return true;
    }
}

export {
    WebscraperController
};