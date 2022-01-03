const webscraper = require('./webscraper/index')

module.exports = {
    awsLambda: require('./aws-lambda/index'),
    sendScrapingRequest: function(url, selector, webscraperToken) {
        return webscraper.handleWebscrapRequest(url, selector, webscraperToken);
    }
};