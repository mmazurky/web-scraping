//initializes the libraries
import axios from 'axios';
import urlExist from "url-exist";

class WebscraperController {
    /**
     * Creates the sitemap in webscraper
     * @param {string} url 
     * @param {string} selector 
     * @param {string} webscraperToken 
     * @returns 
     */
    createSitemap(url, selector, webscraperToken) {
        return new Promise((resolve, reject) => {
            try {
                //gets the sitemaps from the requested page
                this.getSitemaps(url).then(sitemapArray => {
                    //creates a sitemap in webscraper
                    this.createSitemapRequest(url, sitemapArray, selector, webscraperToken).then(sitemapId => {
                        resolve(sitemapId);
                    }).catch(e => {
                        reject(e);
                    });
                }).catch(e => reject(e));
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Gets the sitemaps from the page
     * @param {string} url 
     * @returns 
     */
    getSitemaps(url) {
        return new Promise((resolve, reject) => {
            try {
                // tries to get the sitemaps files from the robots.txt file
                this.retrieveSitemapsFromRobot(url).then(sitemapArray => {
                    // if the sitemap files exists in it, uses them, otherwise uses the default sitemap.xml paths
                    if (sitemapArray && sitemapArray.length > 0) {
                        resolve(sitemapArray);
                    } else {
                        //tries to get the sitemaps from the default paths
                        this.retrieveSitemapsFromDefaultPaths(url).then(sitemapArray => {
                            resolve(sitemapArray);
                        }).catch(e => reject(e));
                    }
                }).catch(e => reject(e));
            } catch (error) {
                reject(error);
            }
        });

    }

    /**
     * Creates a sitemap request in webscraper
     * @param {string} url 
     * @param {array} sitemapArray 
     * @param {string} selector 
     * @param {string} webscraperToken 
     * @returns 
     */
    createSitemapRequest(url, sitemapArray, selector, webscraperToken) {
        return new Promise((resolve, reject) => {
            try {
                let selectors = [];

                // generates a uniqueid for the sitemap (it is needed to allow concurrent scrap requests)
                let urlAux = new URL(url);
                let uniqueid = urlAux.hostname.replace(/\W/g, '-') + "-" + new Date().getTime();

                console.log("> Adding selectors to the request")
                if (sitemapArray && sitemapArray.length > 0) {
                    console.log("-Sitemap files were found - adding sitemap selector");
                    selectors.push(this.retrieveSelectorSitemapXmlLink(sitemapArray));
                } else {
                    console.log("-No sitemap files were found - only the request page will be scraped");
                }
                console.log("-Adding custom text selector with the " + (selector ? selector : "h2") + " element to the request");
                selectors.push(this.retrieveCustomSelectorText(selector, sitemapArray));

                console.log("-Selectors added: " + JSON.stringify(selectors));

                let body = {
                    "_id": uniqueid,
                    "startUrl": [
                        urlAux.protocol + "//" + urlAux.host + (urlAux.pathname ? urlAux.pathname : "/")
                    ],
                    "selectors": selectors
                };

                console.log(JSON.stringify(body));

                // Sends the request
                axios.post("https://api.webscraper.io/api/v1/sitemap?api_token=" + webscraperToken, body).then(res => {
                    if (res && res.data && res.data.data && res.data.data.id) {
                        resolve(res.data.data.id);
                    } else {
                        reject(res.data ? JSON.stringify(res.data) : res);
                    }
                }).catch(e => {
                    reject(e.response && e.response.data ? JSON.stringify(e.response.data) : e.response ? JSON.stringify(e.response) : e);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Retrieves the sitemaps from the robots.txt file
     * @param {string} url 
     * @returns 
     */
    retrieveSitemapsFromRobot(url) {
        return new Promise((resolve, reject) => {
            try {
                console.log("> Searching for sitemaps in robots.txt");
                let sitemapArray = [];

                // formats the robots' file path
                let urlAux = new URL(url);
                let robotsFilePath = urlAux.protocol + "//" + urlAux.host + urlAux.pathname + "robots.txt";

                // defines the callback functions
                let successCallback = function () {
                    console.log(sitemapArray.length > 0 ? "-Sitemaps found in robot.xml: " + sitemapArray : "-Sitemaps not found in robots.txt");
                    resolve(sitemapArray);
                }
                let errorCallback = function (e) {
                    console.log("Error: " + e);
                    resolve(sitemapArray);
                }

                // checks if robots.txt file exists
                urlExist(robotsFilePath).then(exists => {
                    if (exists) {
                        // search for sitemaps in robots.txt
                        axios.get(robotsFilePath).then(res => {
                            // splits robots.txt value for break line
                            let splitted = res.data.split(/\r?\n/);
                            for (let i = 0; i < splitted.length; i++) {
                                if (splitted[i].includes("Sitemap:")) {
                                    // if sitemap information is present, adds its value to the array
                                    sitemapArray.push(splitted[i].replace("Sitemap:", "").replace(/\s/g, ""));
                                }
                            }
                            successCallback();
                        }).catch(e => {
                            errorCallback(e);
                        })
                    } else {
                        // robots.txt file not found - in this case, continues the process to find the sitemaps in other places
                        successCallback();
                    }
                }).catch(e => console.log("An error has occurred: " + e));
            } catch (e) {
                errorCallback(e);
            }
        });
    }

    /**
     * Retrieves the "sitemap xml link" selector for webscraper
     * @param {array} sitemapArray 
     * @returns 
     */
    retrieveSelectorSitemapXmlLink(sitemapArray) {
        return {
            "id": "sitemap",
            "type": "SelectorSitemapXmlLink",
            "parentSelectors": [
                "_root"
            ],
            "sitemapXmlMinimumPriority": 0.1,
            "sitemapXmlUrlRegex": "",
            "sitemapXmlUrls": sitemapArray
        };
    }

    /**
     * Retrieves the "custom text" selector for webscraper
     * @param {string} selector 
     * @param {array} sitemapArray 
     * @returns 
     */
    retrieveCustomSelectorText(selector, sitemapArray) {
        return {
            "id": "custom",
            "type": "SelectorText",
            "parentSelectors": [
                sitemapArray && sitemapArray.length > 0 ? "sitemap" : "_root"
            ],
            "selector": selector && selector != "" ? selector : "h2",
            "multiple": true,
            "regex": "",
            "delay": 0
        };
    }

    /**
     * Retrieves the sitemaps from its default paths
     * @param {string} urlToScrap 
     * @returns 
     */
    retrieveSitemapsFromDefaultPaths(urlToScrap) {
        return new Promise((resolve, reject) => {
            let sitemapArray = [];

            let promises = this.retrieveDefaultSitemapFilesLocation(urlToScrap).map(url => urlExist(url).then(exists => {
                if (exists) {
                    sitemapArray.push(url);
                }
            }));
            Promise.all(promises).then(results => {
                console.log("> Searching for sitemaps in the default paths");
                console.log(sitemapArray.length > 0 ? "-Sitemaps found in default paths: " + sitemapArray : "-Sitemaps not found in default paths");
                resolve(sitemapArray);
            });
        });
    }

    /**
     * Retrieves the default sitemap files' location
     * @param {string} urlToScrap 
     * @returns 
     */
    retrieveDefaultSitemapFilesLocation(urlToScrap) {
        let defaultSitemapFilesLocation = [];

        try {
            let url = new URL(urlToScrap);

            let urlBegin = url.protocol + "//" + url.host + (url.pathname ? url.pathname : "/");

            defaultSitemapFilesLocation = [
                urlBegin + "sitemap.xml",
                urlBegin + "sitemap.xml.gz",
                urlBegin + "sitemap_index.xml",
                urlBegin + "sitemap-index.xml",
                urlBegin + "sitemap_index.xml.gz",
                urlBegin + "sitemap-index.xml.gz",
                urlBegin + ".sitemap.xml",
                urlBegin + ".sitemap",
                urlBegin + "admin/config/search/xmlsitemap",
                urlBegin + "sitemap/sitemap-index.xml"
            ];
        } catch (error) {
            console.log("An exception has occurred: " + error);
        }

        return defaultSitemapFilesLocation;
    }
}

export {
    WebscraperController
};