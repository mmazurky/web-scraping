//initializes the libraries
import { createSitemap } from 'create-sitemap-request';
import { createScrapingJob } from 'create-scraping-job-request'

class WebscraperController {
    /**
     * Handles the Scrap request
     * @param {string} url 
     * @param {string} selector 
     * @param {string} webscraperToken 
     * @returns 
     */
    handleWebscrapRequest(url, selector, webscraperToken) {
        return new Promise((resolve, reject) => {
            console.log("----------------- STARTING SCRAPING REQUEST -----------------");
            console.log("Request | URL: " + url + " / Selector: " + selector + " / Token: " + webscraperToken);
            console.log("----------------- CREATING SITEMAP -----------------");
            createSitemap(url, selector, webscraperToken).then(sitemapId => {
                console.log("-Sitemap created with success! id: " + sitemapId);
                console.log("----------------- CREATING SCRAPING JOB -----------------");
                createScrapingJob(sitemapId, webscraperToken).then(scrapingJobId => {
                    console.log("-Scraping Job created with success! id: " + scrapingJobId);
                    console.log("----------------- SCRAPING REQUEST FINISHED WITH SUCCESS! -----------------");
                    resolve(scrapingJobId);
                }).catch(e => {
                    console.log("----------------- SCRAPING REQUEST FAILED -----------------");
                    console.log("-Error creating scraping job: " + e);
                    reject(e);
                })
            }).catch(e => {
                console.log("----------------- SCRAPING REQUEST FAILED -----------------");
                console.log("-Error creating sitemap: " + e);
                reject(e);
            });
        });
    };
}

export {
    WebscraperController
};