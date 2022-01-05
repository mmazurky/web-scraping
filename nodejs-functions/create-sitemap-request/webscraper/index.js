const https = require('https');
const http = require('http');

const createSitemap = function (url, selector, webscraperToken) {
    return new Promise((resolve, reject) => {
        try {
            getSitemaps(url).then(sitemapArray => {
                createSiteMap(url, sitemapArray, selector, webscraperToken).then(sitemapId => {
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

function getSitemaps(url) {
    return new Promise((resolve, reject) => {
        try {
            // tries to get the sitemaps files from the robots.txt file
            retrieveSitemapsFromRobot(url).then(sitemapArray => {
                // if the sitemap files exists in it, uses them, otherwise uses the default sitemap.xml paths
                if (sitemapArray && sitemapArray.length > 0) {
                    resolve(sitemapArray);
                } else {
                    retrieveSitemapsFromDefaultPaths(url).then(sitemapArray => {
                        resolve(sitemapArray);
                    }).catch(e => reject(e));
                }
            }).catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    });

}

function createSiteMap(url, sitemapArray, selector, webscraperToken) {
    return new Promise((resolve, reject) => {
        try {
            let selectors = [];

            // generates a uniqueid
            let urlAux = new URL(url);
            let uniqueid = urlAux.hostname.replace(/\W/g, '-') + "-" + new Date().getTime();

            console.log("> Adding selectors to the request")
            if (sitemapArray && sitemapArray.length > 0) {
                console.log("-Sitemap files were found - adding sitemap selector");
                selectors.push(retrieveSelectorSitemapXmlLink(sitemapArray));
            } else {
                console.log("-No sitemap files were found - only the request page will be scraped");
            }
            console.log("-Adding custom text selector with the " + (selector ? selector : "h2") + " element to the request");
            selectors.push(retrieveCustomSelectorText(selector, sitemapArray));

            console.log("-Selectors added: " + JSON.stringify(selectors));

            let body = JSON.stringify({
                "_id": uniqueid,
                "startUrl": [
                    url
                ],
                "selectors": selectors
            });

            console.log(body);

            // An object of options to indicate where to post to
            let post_options = {
                host: "api.webscraper.io",
                path: "/api/v1/sitemap?api_token=" + webscraperToken,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(body)
                }
            };

            // Set up the request
            let post_req = https.request(post_options, function (res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    let resObj = JSON.parse(chunk);

                    if (resObj.data && resObj.data.id) {
                        resolve(resObj.data.id);
                    } else {
                        reject(chunk);
                    }
                });
                res.on('error', function (e) {
                    reject(e);
                });
            });

            // post the data
            post_req.write(body);
            post_req.end();
        } catch (error) {
            reject(error);
        }
    });
}

function retrieveSitemapsFromRobot(url) {
    return new Promise((resolve, reject) => {
        try {
            console.log("> Searching for sitemaps in robots.txt");
            let urlAux = new URL(url);
            let sitemapArray = [];
            let get_options = {
                host: urlAux.host,
                path: urlAux.pathname + "/robots.txt",
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };

            // Set up the request
            const protocol = urlAux.protocol.startsWith('https') ? https : http;
            let get_req = protocol.request(get_options, function (res) {
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    let splitted = chunk.split(/\r?\n/);
                    for (let i = 0; i < splitted.length; i++) {
                        if (splitted[i].includes("Sitemap:")) {
                            sitemapArray.push(splitted[i].replace("Sitemap:", "").replace(/\s/g, ""));
                        }
                    }
                });
                res.on('error', function (e) {
                    reject(e);
                });
                res.on('end', function (chunk) {
                    console.log(sitemapArray.length > 0 ? "-Sitemaps found in robot.xml: " + sitemapArray : "-Sitemaps not found in robots.txt");
                    resolve(sitemapArray);
                });
            });

            // get the data
            get_req.end();
        } catch (e) {
            reject(e);
        }
    });
}

function retrieveSelectorSitemapXmlLink(sitemapArray) {
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

function retrieveCustomSelectorText(selector, sitemapArray) {
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

function retrieveSitemapsFromDefaultPaths(urlToScrap) {
    return new Promise((resolve, reject) => {
        let sitemapArray = [];
        let promises = retrieveDefaultSitemapFilesLocation(urlToScrap).map(url => pathExists(url).then(response => {
            let jsonResponse = JSON.parse(response);
            if (jsonResponse.exists) {
                sitemapArray.push(jsonResponse.url);
            }
        }));
        Promise.all(promises).then(results => {
            console.log("> Searching for sitemaps in the default paths");
            console.log(sitemapArray.length > 0 ? "-Sitemaps found in default paths: " + sitemapArray : "-Sitemaps not found in default paths");
            resolve(sitemapArray);
        });
    });
}

function retrieveDefaultSitemapFilesLocation(urlToScrap) {
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

function pathExists(path) {
    return new Promise((resolve, reject) => {
        // mounts the URL to get the scraping result
        https.get(path, (response) => {
            let jsonResponse = {
                url: path,
                exists: response.statusCode == 200
            };
            resolve(JSON.stringify(jsonResponse));
        });
    });
}

module.exports = {
    createSitemap
}