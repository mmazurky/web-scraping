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

}

export const getEnvProperty = PropertiesUtilities.getEnvProperty;