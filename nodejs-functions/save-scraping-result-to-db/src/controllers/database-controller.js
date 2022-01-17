import { DatabaseConfig } from "../configs/database-config.js";
import { retrieveScrapingDBTable, retrieveScrapingDBColumn
} from "../utils/database-utilities.js"

class DatabaseController {
    constructor() {
        this.dbClient = DatabaseConfig.getInstance().getDBClient();
    }

    /**
     * Saves the Scraping Data to Database
     * @param {string} scrapingData
     * @param {knex} dbClient
     * @returns 
     */
    saveScrapingResultToDB(scrapingData) {
        return new Promise((resolve, reject) => {
            try {
                let scrapingTable = retrieveScrapingDBTable();
                let scrapingColumn = retrieveScrapingDBColumn();

                let scrapingResult = [{
                    [scrapingColumn]: scrapingData
                }];

                // inserts the result in tb_scraping table
                this.dbClient(scrapingTable).insert(scrapingResult).then(result => {
                    resolve(true);
                }).catch((error) => {
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