const aws = require('aws-sdk');
const https = require('https');
const http = require('http');

// insert your webscraper's token here
const webscraperToken = "";
// insert your aws's iam 'access key id' here
const awsIamAccessKeyId = "";
// insert your aws's iam 'secret access key' here
const awsIamSecretAccessKey = "";
// insert your s3 bucket here
const s3BucketName = "";

aws.config.update({ accessKeyId: awsIamAccessKeyId, secretAccessKey: awsIamSecretAccessKey });

exports.handler = function (event, context) {
    var sitemapId = "";
    var scrapingJobId = "";
    var sitemapName = "";
    var decodedBody = Buffer.from(event.body, 'base64').toString().split("&");

    for (var i = 0; i < decodedBody.length; i++) {
        if (decodedBody[i].includes("sitemap_id")) {
            sitemapId = decodedBody[i].replace("sitemap_id=", "");
        } else if (decodedBody[i].includes("scrapingjob_id")) {
            scrapingJobId = decodedBody[i].replace("scrapingjob_id=", "");
        } else if (decodedBody[i].includes("sitemap_name")) {
            sitemapName = decodedBody[i].replace("sitemap_name=", "");
        }
    }

    // saves the file to S3
    saveToS3("https://api.webscraper.io/api/v1/scraping-job/" + scrapingJobId + "/json?api_token=" + webscraperToken, sitemapName + ".json");
    // deletes the generated scraping job
    deleteScrapingJob(scrapingJobId);
    // deletes the generated sitemap
    deleteSitemap(sitemapId);
}

function saveToS3(url, fileName) {
    const storage = new aws.S3({ apiVersion: '2006-03-01' });

    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        protocol.get(url, (response) => {
            const buffers = [];
            response.on('error', (err) => { reject(err); });
            response.on('data', (buffer) => {
                buffers.push(buffer);
            });
            response.on('end', () => {
                const uploadParams = {
                    Bucket: s3BucketName,
                    Key: fileName,
                    Body: Buffer.concat(buffers),
                };
                resolve(storage.putObject(uploadParams).promise());
            });
        });
    });
}

function deleteScrapingJob(scrapingJobId) {
    try {
        callDeleteAPI("api.webscraper.io", "/api/v1/scraping-job/" + scrapingJobId + "?api_token=" + webscraperToken);
    } catch (e) {
        console.log("Exception: " + e);
    }
}

function deleteSitemap(sitemapId) {
    try {
        callDeleteAPI("api.webscraper.io", "/api/v1/sitemap/" + sitemapId + "?api_token=" + webscraperToken);
    } catch (e) {
        console.log("Exception: " + e);
    }
}

function callDeleteAPI(hostConfig, pathConfig) {
    var delete_options = {
        host: hostConfig,
        path: pathConfig,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };


    // Set up the request
    var delete_req = https.request(delete_options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);

        });
        res.on('error', function (e) {
            console.log("Got error: " + e.message);
        });

    });

    // delete the data
    delete_req.end();
}
