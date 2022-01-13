import PropertiesReader from 'properties-reader';
import Path from 'path';

class PropertiesUtilities {
    /**
     * Gets the property value from a properties file
     * @param {string} filename 
     * @param {string} property 
     * @returns
     */
    static getProperty(filename, property) {
        let propertyValue = "";
    
        try {
            //default properties path
            let propertiesPath = getDefaultPropertiesPath(filename);
    
            //gets the property value
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
    static setProperty(filename, propertyName, propertyValue) {
        return new Promise((resolve, reject) => {
            try {
                //default properties path
                let propertiesPath = getDefaultPropertiesPath(filename);
    
                //sets the property value
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
    static getDefaultPropertiesPath(filename) {
        return Path.resolve('src/config/' + filename + ".properties");
    }

    /**
     * Retrieves a property from the .env file (or in the environment itself)
     * @param {string} property 
     * @returns 
     */
     static getEnvProperty(property) {
        try {
            let properties = PropertiesReader(Path.resolve('.env'));

            return properties.get(property) != null ? properties.get(property) : process.env[property] ? process.env[property] : "";
        } catch (e) {
            console.log("An error has occurred: " + e);
            return "";
        }
    }

    /**
     * Defines a value for a property in env file
     * @param {string} filename 
     * @param {string} propertyName 
     * @param {*} propertyValue 
     * @returns 
     */
     static setEnvProperty(propertyName, propertyValue) {
        return new Promise((resolve, reject) => {
            try {
                let propertiesPath = Path.resolve('.env');
                //sets the property value
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
}

export const getProperty = PropertiesUtilities.getProperty;
export const setProperty = PropertiesUtilities.setProperty;
export const getEnvProperty = PropertiesUtilities.getEnvProperty;
export const getDefaultPropertiesPath = PropertiesUtilities.getDefaultPropertiesPath;
export const setEnvProperty = PropertiesUtilities.setEnvProperty;