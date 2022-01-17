import PropertiesReader from 'properties-reader';
import Path from 'path';

class PropertiesUtilities {
    /**
     * Retrieves a property from the .env file (or in the environment itself)
     * @param {string} property 
     * @returns 
     */
    static getEnvProperty(property) {
        let processVariable = process.env[property] ? process.env[property] : "";

        if (processVariable === "") {
            let properties = PropertiesReader(Path.resolve('.env'));
            processVariable = properties.get(property) !== null ? properties.get(property) : "";
        }

        return processVariable;

    }

    /**
     * Defines a value for a property in env file
     * @param {string} propertyName 
     * @param {*} propertyValue 
     * @returns 
     */
    static async setEnvProperty(propertyName, propertyValue) {
        let propertiesPath = Path.resolve('.env');
        //sets the property value
        let properties = PropertiesReader(propertiesPath, {
            writer: {
                saveSections: true
            }
        });
        properties.set(propertyName, propertyValue);

        //saves the property value
        await properties.save(propertiesPath);
    }

}

export const getEnvProperty = PropertiesUtilities.getEnvProperty;
export const setEnvProperty = PropertiesUtilities.setEnvProperty;