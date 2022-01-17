import { retrieveDatabaseConfig } from "../utils/database-utilities.js";
import knex from 'knex';

class DatabaseConfigSingleton {
    constructor() {
        this.configDBClient();
    }

    /**
     * Configure the DB Client
     */
    configDBClient() {
        // retrieves the database config
        this.databaseConfig = retrieveDatabaseConfig();

        // starts the db library 
        this.knex = new knex({
            client: this.databaseConfig.client,
            connection: {
                database: this.databaseConfig.name,
                port: this.databaseConfig.port,
                host: this.databaseConfig.host,
                user: this.databaseConfig.user,
                password: this.databaseConfig.password
            }
        });
    }

    /**
     * Manage DB Config's update
     */
    manageDBConfigUpdate() {
        let newDatabaseConfig = retrieveDatabaseConfig();
        if (JSON.stringify(newDatabaseConfig) !== JSON.stringify(this.databaseConfig)) {
            // update the dbClient
            this.configDBClient();
        }
    }

    /**
     * Retrieves the DB Client
     * @returns 
     */
    getDBClient() {
        // check for config updates
        this.manageDBConfigUpdate();

        return this.knex;
    }

    /**
     * Sets the DB Client
     * @param {knex} dbClient 
     */
    setDBClient(dbClient) {
        this.knex = dbClient;
    }

    /**
     * Retrieve database's config
     * @returns 
     */
    retrieveDBConfig() {
        return this.databaseConfig;
    }
}


class DatabaseConfig {
    constructor() {
        throw new Error('Use DatabaseConfig.getInstance()');
    }

    static getInstance() {
        if (!DatabaseConfig.instance) {
            DatabaseConfig.instance = new DatabaseConfigSingleton();
        }
        return DatabaseConfig.instance;
    }

}

export {
    DatabaseConfig
}