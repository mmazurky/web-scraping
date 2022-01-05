var lzString = require('lz-string');

const retrieveScrapingConfigValue = function (body, configName) {
    let configValue = "";

    let responseBody = body.split("&");

    for (var i = 0; i < responseBody.length; i++) {
        if (responseBody[i].includes(configName)) {
            configValue = responseBody[i].replace(configName + "=", "");
            break;
        }
    }

    return configValue;
};

function compressString(string) {
    try {
        return lzString.compress(string);
    } catch (error) {
        console.log("error: " + error);
        return "";
    }
}

function decompressString(string) {
    try {
        return lzString.decompress(string);
    } catch (error) {
        console.log("error: " + error);
        return "";
    }
}

module.exports = {
    retrieveScrapingConfigValue,
    compressString,
    decompressString
};