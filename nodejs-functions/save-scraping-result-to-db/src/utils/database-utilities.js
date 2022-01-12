import { getEnvProperty } from './properties-utilities.js';

class DatabaseUtilities {
    static retrieveDatabaseConfig() {
        // db config variables (configured as environment variables)
        return {
            host: getEnvProperty("DB_HOST"),
            port: getEnvProperty("DB_PORT"),
            user: getEnvProperty("DB_USER"),
            password: getEnvProperty("DB_PASSWORD"),
            name: getEnvProperty("DB_NAME"),
            client: getEnvProperty("DB_CLIENT"),
        }
    }
}

export const retrieveDatabaseConfig = DatabaseUtilities.retrieveDatabaseConfig;