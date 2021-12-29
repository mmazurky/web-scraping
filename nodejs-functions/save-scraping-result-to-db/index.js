// db config variables (configured as environment variables)
const dbName = process.env.DB_NAME;
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

exports.handler = function(event, context, callback) {
    console.log('Received event:', event);

    try {
        saveToDB(event);
        executeCallback(null, callback);
    } catch (error) {
        console.log("An error occurred: " + error);
        executeCallback(error, callback);
    }
};

function saveToDB(scrapingData) {
    const options = {
        client: 'mysql2',
        connection: {
            database: dbName,
            host: dbHost,
            user: dbUser,
            password: dbPassword
        }
    }

    const knex = require('knex')(options);

    const scrapingResult = [
        { scraping_data: scrapingData }
    ]

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

    callback(error, JSON.stringify(response));
}