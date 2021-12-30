const https = require('https');
const http = require('http');
const { resolve } = require('path');

// webscraper's token (configured as environment variable)
const webscraperToken = process.env.WEBSCRAPER_TOKEN;

exports.handler = function(event, context, callback) {
    console.log('Received event:', event);

    try {
        // deletes the scraping request
        createSitemapRequest(event).then(sitemapId => {
            console.log("Finished with success!");
            // returns the request status
            executeCallback(null, callback, sitemapId);
        }).catch(error => {
            console.log("An exception has occurred: " + error);
            // returns the request status
            executeCallback(error, callback, null);
        });
    }
    catch (error) {
        console.log("An exception has occurred: " + error);
        // returns the request status
        executeCallback(error, callback, null);
    }
};

function createSitemapRequest(event) {
    return new Promise((resolve, reject) => {
        try {
            getSitemaps(event.url, event.name).then(sitemapArray => {
                createSiteMap(event.url, event.name, sitemapArray, event.selector).then(sitemapId => {
                    resolve(sitemapId);
                }).catch(e => reject(e));
            }).catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    });
}

function getSitemaps(url, name) {
    return new Promise((resolve, reject) => {
        try {
            // tries to get the sitemaps files from the robots.txt file
            retrieveSitemapsFromRobot(url, name).then(sitemapArray => {
                // if the sitemap files exists in it, uses them, otherwise uses the default sitemap.xml paths
                if (sitemapArray && sitemapArray > 0) {
                    resolve(sitemapArray);
                }
                else {
                    retrieveSitemapsFromDefaultPaths(url).then(sitemapArray => {
                        resolve(sitemapArray);
                    }).catch(e => reject(e));
                }
            });
        }
        catch (error) {
            reject(error);
        }
    });

}

function createSiteMap(url, name, sitemapArray, selector) {
    return new Promise((resolve, reject) => {
        try {
            let selectors = [];

            // generates a uniqueid
            var uniqueid = name.trim().replace(" ", "_");

            if (sitemapArray && sitemapArray.length > 0) {
                selectors.push(retrieveSelectorSitemapXmlLink(sitemapArray));
            }
            selectors.push(retrieveCustomSelectorText(selector, sitemapArray));

            var body = JSON.stringify({
                "_id": uniqueid,
                "startUrl": [
                    url
                ],
                "selectors": [
                    selectors
                ]
            });
            console.log("body: " + JSON.stringify(body));

            // An object of options to indicate where to post to
            var post_options = {
                host: "api.webscraper.io",
                path: "/api/v1/sitemap?api_token=" + webscraperToken,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(body)
                }
            };

            // Set up the request
            var post_req = https.request(post_options, function(res) {
                res.setEncoding('utf8');
                res.on('data', function(chunk) {
                    var resObj = JSON.parse(chunk);

                    if (resObj.data && resObj.data.id) {
                        resolve(resObj.data.id);
                    }
                    else {
                        reject("Failure in sitemap creation: " + chunk);
                    }
                });
                res.on('error', function(e) {
                    reject(e);
                });
            });

            // post the data
            post_req.write(body);
            post_req.end();
        }
        catch (error) {
            reject(error);
        }
    });
}

function retrieveSitemapsFromRobot(url, name) {
    return new Promise((resolve, reject) => {
        try {
            var urlAux = new URL(url);
            var sitemapArray = [];
            var get_options = {
                host: urlAux.host,
                path: "/robots.txt",
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };

            // Set up the request
            const protocol = urlAux.protocol.startsWith('https') ? https : http;
            var get_req = protocol.request(get_options, function(res) {
                res.setEncoding('utf8');
                res.on('data', function(chunk) {
                    console.log('Response: ' + chunk);
                    var splitted = chunk.split(/\r?\n/);
                    for (var i = 0; i < splitted.length; i++) {
                        if (splitted[i].includes("Sitemap:")) {
                            sitemapArray.push(splitted[i].replace("Sitemap:", "").replace(/\s/g, ""));
                        }
                    }

                    console.log(sitemapArray);
                });
                res.on('error', function(e) {
                    reject(e);
                });
                res.on('end', function(chunk) {
                    resolve(sitemapArray);
                });
            });

            // get the data
            get_req.end();
        }
        catch (e) {
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
        var promises = retrieveDefaultSitemapFilesLocation(urlToScrap).map(url => pathExists(url).then(response => {
            let jsonResponse = JSON.parse(response);
            if (jsonResponse.exists) {
                sitemapArray.push(jsonResponse.url);
            }
        }));
        Promise.all(promises).then(results => {
            resolve(sitemapArray);
        });
    });
}

function retrieveDefaultSitemapFilesLocation(urlToScrap) {
    let defaultSitemapFilesLocation = [];

    try {
        var url = new URL(urlToScrap);

        defaultSitemapFilesLocation = [
            url.protocol + "//" + url.host + "/" + "sitemap.xml",
            url.protocol + "//" + url.host + "/" + "sitemap.xml.gz",
            url.protocol + "//" + url.host + "/" + "sitemap_index.xml",
            url.protocol + "//" + url.host + "/" + "sitemap-index.xml",
            url.protocol + "//" + url.host + "/" + "sitemap_index.xml.gz",
            url.protocol + "//" + url.host + "/" + "sitemap-index.xml.gz",
            url.protocol + "//" + url.host + "/" + ".sitemap.xml",
            url.protocol + "//" + url.host + "/" + ".sitemap",
            url.protocol + "//" + url.host + "/" + "admin/config/search/xmlsitemap",
            url.protocol + "//" + url.host + "/" + "sitemap/sitemap-index.xml"
        ];
    }
    catch (error) {
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

function executeCallback(error, callback, sitemapId) {
    let response = {
        status: !error ? 200 : 400,
        success: !error,
        sitemapId: sitemapId
    };

    // executes the callback
    callback(null, JSON.stringify(response));
}