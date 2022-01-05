/**
 * Retrieves the scraping config value
 * received from webscraper
 * @param {*} body 
 * @param {string} configName 
 * @returns 
 */
 const retrieveScrapingConfigValue = function (body, configName) {
    let configValue = "";

    //gets the response body (splitted by &)
    let responseBody = body.split("&");

    for (var i = 0; i < responseBody.length; i++) {
        if (responseBody[i].includes(configName)) {
            //gets the config value
            configValue = responseBody[i].replace(configName + "=", "");
            break;
        }
    }

    return configValue;
};

module.exports = {
    retrieveScrapingConfigValue
};