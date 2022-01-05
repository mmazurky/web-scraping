const awsLambda = require('./aws-lambda/index');
const webscraper = require('./webscraper/index');

module.exports = {
    awsLambdaHandler: function(event, context) {
        return awsLambda.handler(event, context);
    },
    createSitemap: function(url, selector, webscraperToken) {
        return webscraper.createSitemap(url, selector, webscraperToken);
    }
};