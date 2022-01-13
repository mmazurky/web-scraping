import axios from 'axios';

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
            //default scraping job delete's path
            let scrapingJobDeletePath = "https://api.webscraper.io/api/v1/scraping-job/" + scrapingJobId + "?api_token=" + webscraperToken;
            //default sitemap delete's path
            let sitemapDeletePath = "https://api.webscraper.io/api/v1/sitemap/" + sitemapId + "?api_token=" + webscraperToken;
    
            // deletes the scraping job
            return this.callDeleteAPI(scrapingJobDeletePath).then(function () {
                // deletes the sitemap
                this.callDeleteAPI(sitemapDeletePath).then(() => {
                    resolve(true);
                }).catch(function (e) {
                    reject(e);
                });
            }).catch(function (e) {
                reject(e);
            });
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
                let result = JSON.parse(res.data);
    
                if (result.success) {
                    resolve(res);
                } else {
                    console.log("Got error in " + url, res);
                    reject(res);
                }
            }).catch(e => {
                console.log("Got error in " + url, e);
                reject(e);
            })
        });
    }
}

export {
    WebscraperController
};