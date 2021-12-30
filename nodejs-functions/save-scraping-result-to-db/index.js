// db config variables (configured as environment variables)
const dbName = process.env.DB_NAME;
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

exports.handler = function(event, context, callback) {
    console.log('Received event:', event);

    try {
        // saves the result to the DB
        saveToDB(event).then(() => {
            console.log("Finished with success!");
            // returns the request status
            executeCallback(null, callback);
        }).catch(error => {
            console.log("An exception has occurred: " + error);
            // returns the request status
            executeCallback(error, callback);    
            
        });
    } catch (error) {
        console.log("An exception has occurred: " + error);
        // returns the request status
        executeCallback(error, callback);
    }
};

function saveToDB(scrapingData) {
    return new Promise((resolve, reject) => {
        try {
            // uses the column 'scraping_data' to store the result
            const scrapingResult = [
                { scraping_data: scrapingData }
            ]
        
            // starts the db library 
            const knex = require('knex')({
                client: 'mysql2',
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
}

function executeCallback(error, callback) {
    let response = {
        status : !error ? 200 : 400,
        success : !error
    };

    // executes the callback
    callback(null, JSON.stringify(response));
}