//initializes the libraries
const awsLambdaUtilities = require('../lib/aws-lambda-utilities');
const webscraper = require('../webscraper/index')

/**
 * Handler method used by AWS Lambda
 * @param {string} event 
 * @param {*} context 
 */
const handler = function (event, context) {
    try {
        handleWebscrapResponse(event).then(() => {
            console.log("Finished with success!");
            context.succeed();
        }).catch(e => {
            console.log("An exception has occurred: " + e);
            context.fail(e);
        })
    } catch (e) {
        console.log("An exception has occurred: " + e);
        context.fail(e);
    }
};

/**
 * Handles the Scrap response
 * @param {*} event 
 * @returns 
 */
function handleWebscrapResponse(event) {
    return new Promise((resolve, reject) => {
        try {
            // retrieves the scraping job id received in the response
            let scrapingJobId = awsLambdaUtilities.retrieveScrapingConfigValue(event, "scrapingjob_id");
            // retrieves the sitemap id received in the response
            let sitemapId = awsLambdaUtilities.retrieveScrapingConfigValue(event, "sitemap_id");
            // retrieves the webscraper token received in the response
            let webscraperToken = awsLambdaUtilities.retrieveScrapingConfigValue(event, "webscraper_token");

            // retrieves the scraping result
            return webscraper.retrieveScrapingResult(scrapingJobId, webscraperToken).then(scrapingResult => {
                // saves the scraping result to DB
                awsLambdaUtilities.callLambdaFunction('save-scraping-result-to-db', scrapingResult).then(() => {
                    // deletes the scraping request
                    awsLambdaUtilities.callLambdaFunction('delete-scraping-request', {
                        "scrapingJobId": scrapingJobId,
                        "sitemapId": sitemapId
                    }).then(() => {
                        resolve(true);
                    }).catch(e => {
                        reject(e);
                    })
                }).catch(e => {
                    reject(e);
                })
            }).catch(e => {
                reject(e);
            })
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    handler
}