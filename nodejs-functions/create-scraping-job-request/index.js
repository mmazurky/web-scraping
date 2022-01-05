const awsLambda = require('./aws-lambda/index');
const webscraper = require('./webscraper/index');

module.exports = {
    awsLambdaHandler: function(event, context) {
        return awsLambda.handler(event, context);
    },
    createScrapingJob: function(sitemapId, webscraperToken) {
        return webscraper.createScrapingJob(sitemapId, webscraperToken);
    }
};