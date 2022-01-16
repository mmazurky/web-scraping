//initializes the libraries
import axios from 'axios';
import urlExist from "url-exist";
import * as WebscraperConstants from '../constants/webscraper-constants.js';
import { retrieveDefaultSitemapFiles, formatURLPath } from '../utils/webscraper-utilities.js'

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
                //validates the fields
                this.validatesendCreateSitemapRequest(url, selector, webscraperToken);

                //gets the sitemaps from the requested page
                this.getSitemaps(url).then(sitemapArray => {
                    //creates a sitemap in webscraper
                    this.sendCreateSitemapRequest(url, sitemapArray, selector, webscraperToken).then(sitemapId => {
                        resolve(sitemapId);
                    }).catch(e => {
                        reject(e);
                    });
                });
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
            // tries to get the sitemaps files from the robots.txt file
            this.retrieveSitemapsFromRobot(url).then(sitemapArray => {
                // if the sitemap files exists in it, uses them, otherwise uses the default sitemap.xml paths
                if (sitemapArray && sitemapArray.length > 0) {
                    resolve(sitemapArray);
                } else {
                    //tries to get the sitemaps from the default paths
                    this.retrieveAvailableSitemapsFromDefaultPaths(url).then(sitemapArray => {
                        resolve(sitemapArray);
                    });
                }
            })
        });

    }

    /**
     * Sends a sitemap request to webscraper
     * @param {string} url 
     * @param {array} sitemapArray 
     * @param {string} selector 
     * @param {string} webscraperToken 
     * @returns 
     */
    sendCreateSitemapRequest(url, sitemapArray, selector, webscraperToken) {
        return new Promise((resolve, reject) => {
            try {
                let body = this.retrieveCreateSitemapRequestBody(url, sitemapArray, selector);

                console.log(JSON.stringify(body));

                // Sends the request
                axios.post(WebscraperConstants.WEBSCRAPER_HOST + WebscraperConstants.CREATE_SITEMAP_PATH + "?api_token=" + webscraperToken, body).then(res => {
                    //if the scraping job id is present in the response, it was created with success
                    if (res && res.data && res.data.data && res.data.data.id) {
                        resolve(res.data.data.id);
                    } else {
                        reject(res.data);
                    }
                }).catch(e => {
                    console.log("Exception: " + e);
                    //status code different than 200
                    reject(e.response.data);
                });
            } catch (e) {
                console.log("Exception: " + e);
                reject(e);
            }
        });
    }

    retrieveCreateSitemapRequestBody(url, sitemapArray, selector) {
        let urlAux = new URL(url);
        let body = WebscraperConstants.INITIAL_CREATE_SITEMAP_REQUEST_BODY_CONFIG;
        // generates a uniqueid for the sitemap (it is needed to allow concurrent scrap requests)
        body._id = urlAux.hostname.replace(/\W/g, '-') + "-" + new Date().getTime();
        body.startUrl = formatURLPath(url);
        console.log("> Adding selectors to the request")
        if (sitemapArray && sitemapArray.length > 0) {
            console.log("-Sitemap files were found - adding sitemap selector");
            body.selectors.push(this.retrieveSelectorSitemapXmlLink(sitemapArray));
        } else {
            console.log("-No sitemap files were found - only the request page will be scraped");
        }
        //console.log("-Adding custom text selector with the " + (selector ? selector : "h2") + " element to the request");
        body.selectors.push(this.retrieveCustomSelectorText(selector, sitemapArray));

        return body;
    }

    /**
     * Retrieves the sitemaps from the robots.txt file
     * @param {string} url 
     * @returns 
     */
    retrieveSitemapsFromRobot(url) {
        return new Promise((resolve, reject) => {
            let sitemapArray = [];

            // defines the callback functions
            let successCallback = function () {
                console.log(sitemapArray.length > 0 ? "-Sitemaps found in robot.xml: " + sitemapArray : "-Sitemaps not found in robots.txt");
                resolve(sitemapArray);
            }
            let errorCallback = function (e) {
                console.log("Error: " + e);
                resolve(sitemapArray);
            }
            try {
                console.log("> Searching for sitemaps in robots.txt");

                // formats the robots' file path
                let urlAux = new URL(url);
                let robotsFilePath = urlAux.protocol + "//" + urlAux.host + urlAux.pathname + "robots.txt";

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
                            successCallback();
                        })
                    } else {
                        // robots.txt file not found - in this case, continues the process to find the sitemaps in other places
                        successCallback();
                    }
                });
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
        let initialSelectorConfig = WebscraperConstants.INITIAL_SELECTOR_SITEMAP_XML_LINK_CONFIG;

        initialSelectorConfig.sitemapXmlUrls = sitemapArray;

        return initialSelectorConfig;
    }

    /**
     * Retrieves the "custom text" selector for webscraper
     * @param {string} selector 
     * @param {array} sitemapArray 
     * @returns 
     */
    retrieveCustomSelectorText(selector, sitemapArray) {
        let initialSelectorConfig = WebscraperConstants.INITIAL_CUSTOM_SELECTOR_CONFIG;

        initialSelectorConfig.parentSelectors = [sitemapArray && sitemapArray.length > 0 ? WebscraperConstants.CUSTOM_SELECTOR_SITEMAP_SELECTORS : WebscraperConstants.CUSTOM_SELECTOR_SINGLE_PAGE_SELECTORS];
        initialSelectorConfig.selector = selector && selector != "" ? selector : WebscraperConstants.CUSTOM_SELECTOR_DEFAULT_SELECTOR;

        return initialSelectorConfig;
    }

    /**
     * Retrieves the available sitemaps from its default paths
     * @param {string} urlToScrap 
     * @returns 
     */
    retrieveAvailableSitemapsFromDefaultPaths(urlToScrap) {
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
            let urlBegin = formatURLPath(urlToScrap);
            retrieveDefaultSitemapFiles().forEach(defaultSitemapFile => {
                defaultSitemapFilesLocation.push(urlBegin + defaultSitemapFile);
            });
        } catch (error) {
            console.log("An exception has occurred: " + error);
        }

        return defaultSitemapFilesLocation;
    }

    /**
     * Validates the request to create a sitemap
     * @param {string} url 
     * @param {string} selector 
     * @param {string} webscraperToken 
     */
    validatesendCreateSitemapRequest(url, selector, webscraperToken) {
        if (!url || !selector || !webscraperToken) {
            throw new Error(WebscraperConstants.INVALID_CREATE_SITEMAP_REQUEST_MESSAGE);
        }
    }
}

export {
    WebscraperController
};