const awsLambda = require('./aws-lambda/index');
const webscraper = require('./webscraper/index');

module.exports = {
    awsLambdaHandler: function(event, context) {
        return awsLambda.handler(event, context);
    },
    deleteScraping: function(scrapingJobId, sitemapId, webscraperToken) {
        return webscraper.deleteScraping(scrapingJobId, sitemapId, webscraperToken);
    }
};