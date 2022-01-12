import { retrieveDatabaseConfig } from "../utils/database-utilities.js"

class DatabaseController {
    constructor() {
        // retrieves the database config
        this.databaseConfig = retrieveDatabaseConfig();

        // starts the db library 
        this.knex = require('knex')({
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
     * Saves the Scraping Data to Database
     * @param {string} scrapingData
     * @returns 
     */
    saveScrapingResultToDB(scrapingData) {
        return new Promise((resolve, reject) => {
            try {
                // uses the column 'scraping_data' to store the result
                let scrapingResult = [{
                    scraping_data: scrapingData
                }]

                // inserts the result in tb_scraping table
                this.knex('tb_scraping').insert(scrapingResult).then(() => {
                    this.knex.destroy();
                    resolve(true);
                }).catch((error) => {
                    this.knex.destroy();
                    reject(error);
                })
            } catch (error) {
                reject(error);
            }
        });
    };
}

export {
    DatabaseController
};