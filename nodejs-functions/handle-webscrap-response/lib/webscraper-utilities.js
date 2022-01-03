const retrieveScrapingConfigValue = function(event, configName) {
    let configValue = "";

    let responseBody = Buffer.from(event.body, 'base64').toString().split("&");

    for (var i = 0; i < responseBody.length; i++) {
        if (responseBody[i].includes(configName)) {
            configValue = responseBody[i].replace(configName + "=", "");
            break;
        }
    }

    return configValue;
};

module.exports = {
    retrieveScrapingConfigValue
};