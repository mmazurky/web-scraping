// possible dbClients = pg, sqlite3, mysql, mysql2, oracledb, tedious - default is mysql2
const saveToDB = function(scrapingData, dbHost, dbUser, dbPassword, dbName, dbClient) {
    return new Promise((resolve, reject) => {
        try {
            // uses the column 'scraping_data' to store the result
            let scrapingResult = [
                { scraping_data: scrapingData }
            ]

            let dbClientAux = dbClient ? dbClient : 'mysql2';
        
            // starts the db library 
            const knex = require('knex')({
                client: dbClientAux,
                connection: {
                    database: dbName,
                    host: dbHost,
                    user: dbUser,
                    password: dbPassword
                }
            });
            
            // inserts the result in tb_scraping table
            knex('tb_scraping').insert(scrapingResult).then(() => {
                knex.destroy();
                resolve(true);
            }).catch((error) => {
                knex.destroy();
                reject(error);
            })
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    saveToDB
}