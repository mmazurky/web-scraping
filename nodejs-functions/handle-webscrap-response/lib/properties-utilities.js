const getProperty = function (filename, property) {
    let propertyValue = "";

    try {
        let propertiesPath = 'config/' + filename + ".properties";

        const PropertiesReader = require('properties-reader');
        let properties = PropertiesReader(propertiesPath);
        propertyValue = properties.get(property);
    } catch (error) {
        console.log("error: " + error);
    }

    return propertyValue;
}

const setProperty = function (filename, propertyName, propertyValue) {
    return new Promise((resolve, reject) => {
        try {
            let propertiesPath = 'config/' + filename + ".properties";

            const PropertiesReader = require('properties-reader');
            let properties = PropertiesReader(propertiesPath, {
                writer: {
                    saveSections: true
                }
            });
            properties.set(propertyName, propertyValue);

            properties.save(propertiesPath, (err, data) => {
                if (err) {
                    reject(error);
                } else {
                    resolve(true);
                }
            });
        } catch (error) {
            console.log("error: " + error);
            reject(error);
        }
    });
}




module.exports = {
    getProperty,
    setProperty
}