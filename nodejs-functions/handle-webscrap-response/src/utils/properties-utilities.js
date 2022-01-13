import PropertiesReader from 'properties-reader';
import Path from 'path';

class PropertiesUtilities {   
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

export const getEnvProperty = PropertiesUtilities.getEnvProperty;
export const setEnvProperty = PropertiesUtilities.setEnvProperty;