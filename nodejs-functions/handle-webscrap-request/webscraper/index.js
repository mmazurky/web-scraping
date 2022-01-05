const createSitemapRequest = require('create-sitemap-request');
const createScrapingJobRequest = require('create-scraping-job-request');

const handleWebscrapRequest = function (url, selector, webscraperToken) {
    return new Promise((resolve, reject) => {
        try {
            console.log("----------------- STARTING SCRAPING REQUEST -----------------");
            console.log("Request | URL: " + url + " / Selector: " + selector + " / Token: " + webscraperToken);
            console.log("----------------- CREATING SITEMAP -----------------");
            createSitemapRequest.createSitemap(url, selector, webscraperToken).then(sitemapId => {
                console.log("-Sitemap created with success! id: " + sitemapId);
                console.log("----------------- CREATING SCRAPING JOB -----------------");
                createScrapingJobRequest.createScrapingJob(sitemapId, webscraperToken).then(scrapingJobId => {
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
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    handleWebscrapRequest
}