// db config variables (configured as environment variables)
const dbName = process.env.DB_NAME;
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

exports.handler = function(event, context, callback) {
    console.log('Received event:', event);

    try {
        // saves the result to the DB
        saveToDB(event);
        // returns the request status
        executeCallback(null, callback);
        
        console.log("Finished with success!");
    } catch (error) {
        console.log("An error occurred: " + error);
        // returns the request status
        executeCallback(error, callback);
    }
};

function saveToDB(scrapingData) {
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
    knex('tb_scraping').insert(scrapingResult).then(() => console.log("data inserted"))
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
}

function executeCallback(error, callback) {
    let response = {
        status : !error ? 200 : 400,
        success : !error
    };

    // executes the callback
    callback(error, JSON.stringify(response));
}