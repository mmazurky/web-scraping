const awsLambda = require('./aws-lambda/index');
const webscraper = require('./webscraper/index');

module.exports = {
    awsLambdaHandler: function(event, context) {
        return awsLambda.handler(event, context);
    },
    handleWebscrapResponse: function(event) {
        return webscraper.handleWebscrapResponse(event);
    }
};