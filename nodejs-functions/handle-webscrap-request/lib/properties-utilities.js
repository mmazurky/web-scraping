/**
 * Gets the property value from a properties file
 * @param {string} filename 
 * @param {string} property 
 * @returns
 */
const getProperty = function (filename, property) {
    let propertyValue = "";

    try {
        //default properties path
        let propertiesPath = getDefaultPropertiesPath(filename);

        //gets the property value
        const PropertiesReader = require('properties-reader');
        let properties = PropertiesReader(propertiesPath);
        propertyValue = properties.get(property);
    } catch (error) {
        console.log("error: " + error);
    }

    return propertyValue;
}

/**
 * Defines a value for a property in a properties file
 * @param {string} filename 
 * @param {string} propertyName 
 * @param {*} propertyValue 
 * @returns 
 */
const setProperty = function (filename, propertyName, propertyValue) {
    return new Promise((resolve, reject) => {
        try {
            //default properties path
            let propertiesPath = getDefaultPropertiesPath(filename);

            //sets the property value
            const PropertiesReader = require('properties-reader');
            let properties = PropertiesReader(propertiesPath, {
                writer: {
                    saveSections: true
                }
            });
            properties.set(propertyName, propertyValue);

            //saves the property value
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

/**
 * Gets the default properties' path
 * @param {string} filename 
 * @returns 
 */
function getDefaultPropertiesPath(filename) {
    return 'config/' + filename + ".properties";
}


module.exports = {
    getProperty,
    setProperty
}