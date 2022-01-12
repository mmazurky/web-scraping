import axios from 'axios';

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
                //sends the request
                axios.post("https://api.webscraper.io/api/v1/scraping-job?api_token=" + webscraperToken,
                    JSON.stringify({
                        "sitemap_id": sitemapId,
                        "driver": "fast", // "fast" or "fulljs"
                        "page_load_delay": 2000,
                        "request_interval": 2000,
                        "proxy": 0
                    })
                ).then(res => {
                    //if the scraping job id is present in the response, it was created with success
                    if (res.data && res.data.id) {
                        resolve(res.data.id);
                    } else {
                        reject(res);
                    }
                }).catch(e => {
                    reject(e.response && e.response.data ? e.response.data : e);
                })
            } catch (e) {
                reject(e);
            }
        });
    }
}

export {
    WebscraperController
};