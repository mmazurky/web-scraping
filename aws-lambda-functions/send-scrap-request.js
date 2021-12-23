const https = require('https');
const http = require('http');

// insert your webscraper's token here
const webscraperToken = "";

exports.handler = function (event, context) {
    var body = getBodyJson(event);
    var url = event.url && event.url != null ? event.url : body != null && body.url ? body.url : null;
    var name = event.name && event.name != null ? event.name : body != null && body.name ? body.name : null;

    // tries to get the sitemaps files from the robots.txt file
    // if the sitemap files exists in it, uses them, otherwise uses the default sitemap.xml paths
    getSitemapsFromRobot(url, name, context);
}

function createSiteMap(url, name, context, sitemapArray) {
    var urlAux = new URL(url);

    // generates a uniqueid
    var uniqueid = name + "-" + Date.now();

    // if the sitemap information is not present in robots.txt
    // uses the default sitemap.xml paths
    if (sitemapArray.length == 0) {
        sitemapArray.push(urlAux.protocol + '//' + urlAux.host + '/sitemap.xml');
        sitemapArray.push(urlAux.protocol + '//' + urlAux.host + '/sitemap.xml.gz');
        sitemapArray.push(urlAux.protocol + '//' + urlAux.host + '/sitemap_index.xml');
        sitemapArray.push(urlAux.protocol + '//' + urlAux.host + '/sitemap-index.xml');
        sitemapArray.push(urlAux.protocol + '//' + urlAux.host + '/sitemap_index.xml.gz');
        sitemapArray.push(urlAux.protocol + '//' + urlAux.host + '/sitemap-index.xml.gz');
        sitemapArray.push(urlAux.protocol + '//' + urlAux.host + '/.sitemap.xml');
        sitemapArray.push(urlAux.protocol + '//' + urlAux.host + '/.sitemap');
        sitemapArray.push(urlAux.protocol + '//' + urlAux.host + '/admin/config/search/xmlsitemap');
        sitemapArray.push(urlAux.protocol + '//' + urlAux.host + '/sitemap/sitemap-index.xml');
    }

    var body = JSON.stringify({
        "_id": uniqueid,
        "startUrl": [
            url
        ],
        "selectors": [
            {
                "id": "sitemap",
                "type": "SelectorSitemapXmlLink",
                "parentSelectors": [
                    "_root"
                ],
                "sitemapXmlMinimumPriority": 0.1,
                "sitemapXmlUrlRegex": "",
                "sitemapXmlUrls": sitemapArray
            },
            {
                "id": "subtitle",
                "type": "SelectorText",
                "parentSelectors": [
                    "sitemap"
                ],
                "selector": "h2",
                "multiple": true,
                "regex": "",
                "delay": 0
            }
        ]
    });

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
    var post_req = https.request(post_options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            var resObj = JSON.parse(chunk);

            if (resObj.data && resObj.data.id) {
                createScrapingJob(resObj.data.id, context);
            } else {
                context.done(null, 'FAILURE');
            }
            //context.succeed();
        });
        res.on('error', function (e) {
            console.log("Got error: " + e.message);
            context.done(null, 'FAILURE');
        });

    });

    // post the data
    post_req.write(body);
    post_req.end();
}

function createScrapingJob(siteMapId, context) {
    var body = JSON.stringify({
        "sitemap_id": siteMapId,
        "driver": "fast", // "fast" or "fulljs"
        "page_load_delay": 2000,
        "request_interval": 2000,
        "proxy": 0
    });

    // An object of options to indicate where to post to
    var post_options = {
        host: "api.webscraper.io",
        path: "/api/v1/scraping-job?api_token=" + webscraperToken,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(body)
        }
    };


    // Set up the request
    var post_req = https.request(post_options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
            var resObj = JSON.parse(chunk);

            if (resObj.success) {
                context.succeed();
            } else {
                console.log('an error ocurred');
                context.done(null, 'FAILURE');
            }
        });
        res.on('error', function (e) {
            console.log("Got error: " + e.message);
            context.done(null, 'FAILURE');
        });

    });

    // post the data
    post_req.write(body);
    post_req.end();
}

function getBodyJson(event) {
    try {
        return event.body && event.body != null ? JSON.parse(event.body) : null;
    } catch (e) {
        console.log("Exception: " + e);
    }
}

function getSitemapsFromRobot(url, name, context) {
    var urlAux = new URL(url);
    var sitemapArray = [];

    try {
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
        var get_req = protocol.request(get_options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('Response: ' + chunk);
                var splitted = chunk.split(/\r?\n/);
                for (var i = 0; i < splitted.length; i++) {
                    if (splitted[i].includes("Sitemap:")) {
                        sitemapArray.push(splitted[i].replace("Sitemap:", "").replace(/\s/g, ""));
                    }
                }

                console.log(sitemapArray);
            });
            res.on('error', function (e) {
                console.log("Got error: " + e.message);
            });
            res.on('end', function (chunk) {
                createSiteMap(url, name, context, sitemapArray)
            })

        });

        // get the data
        get_req.end();
    } catch (e) {
        console.log("Exception:" + e);
    }
}