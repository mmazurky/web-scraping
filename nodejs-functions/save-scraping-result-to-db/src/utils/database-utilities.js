import { getEnvProperty } from './properties-utilities.js';
import * as DatabaseConstants from '../constants/database-constants.js';
import * as EnvConstants from '../constants/env-constants.js';

class DatabaseUtilities {
    /**
     * Retrieves the Database's config
     * @returns 
     */
    static retrieveDatabaseConfig() {
        // db config variables (configured as environment variables)
        return {
            host: getEnvProperty(EnvConstants.DB_HOST),
            port: getEnvProperty(EnvConstants.DB_PORT),
            user: getEnvProperty(EnvConstants.DB_USER),
            password: getEnvProperty(EnvConstants.DB_PASSWORD),
            name: getEnvProperty(EnvConstants.DB_NAME),
            client: getEnvProperty(EnvConstants.DB_CLIENT),
        }
    }

    /**
     * Retrieves the Scraping's Database table
     * @returns 
     */
    static retrieveScrapingDBTable() {
        let envTable = getEnvProperty(EnvConstants.DB_TABLE);

        return envTable !== "" ? envTable : DatabaseConstants.DEFAULT_SCRAPING_TABLE;
    }

    /**
     * Retrieves the Scraping's Database column
     * @returns 
     */
    static retrieveScrapingDBColumn() {
        let envTable = getEnvProperty(EnvConstants.DB_COLUMN);

        return envTable !== "" ? envTable : DatabaseConstants.DEFAULT_SCRAPING_COLUMN;
    }
}

export const retrieveDatabaseConfig = DatabaseUtilities.retrieveDatabaseConfig;
export const retrieveScrapingDBTable = DatabaseUtilities.retrieveScrapingDBTable;
export const retrieveScrapingDBColumn = DatabaseUtilities.retrieveScrapingDBColumn;