const ngrok = require('ngrok');
const main = require("./index");
const express = require('express');
const app = express();
const propertiesUtilities = require("./lib/properties-utilities");
const bodyParser = require('body-parser')

const serverPort = 5001;

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.post("/", (req, res) => {
    console.log("> Webscraper finished the scrap! " + JSON.stringify(req.body));
    res.write('OK'); 
    res.end();
    main.handleWebscrapResponse(req.body).then(() => {
        console.log("----------------- SCRAPING PROCESS FINISHED WITH SUCCESS -----------------");
    }).catch(e => {
        console.log("-An error has occurred: " + e);
    });
});

app.get("/", (req, res) => {
    res.send("");
})

app.get("/config", (req,res) => {
    let webscraperToken = propertiesUtilities.getProperty("webscraper", "token");
    let dbClient = propertiesUtilities.getProperty("database", "client");
    let dbName = propertiesUtilities.getProperty("database", "name");
    let dbHost = propertiesUtilities.getProperty("database", "host");
    let dbUser = propertiesUtilities.getProperty("database", "username");
    let dbPassword = propertiesUtilities.getProperty("database", "password");
    let ngrokToken = propertiesUtilities.getProperty("ngrok", "token");

    let dbClientHtml = getDbClientHtml(dbClient);

    res.send(`
        <!DOCTYPE html>
        <html>
        <body>
            <form action="/config" method="post">
                <h1>Database Config</h1>
                ` + dbClientHtml + `
                <label for="dbHost"><b>Host:</b></label>
                <input type="text" id="dbHost" name="dbHost" value="` + dbHost + `"><br><br>
                <label for="dbName"><b>Name:</b></label>
                <input type="text" id="dbName" name="dbName" value="` + dbName + `"><br><br>
                <label for="dbUser"><b>Username:</b></label>
                <input type="text" id="dbUser" name="dbUser" value="` + dbUser + `"><br><br>
                <label for="dbPassword"><b>Password:</b></label>
                <input type="password" id="dbPassword" name="dbPassword" value="` + dbPassword + `"><br><br>
                <h1>Webscraper Config</h1>
                <label for="webscraperToken"><b>Webscraper Token:</b></label>
                <input type="text" id="webscraperToken" name="webscraperToken" value="` + webscraperToken + `"><br><br>
                <h1>Ngrok Config</h1>
                <label for="ngrokToken"><b>Ngrok Token:</b></label>
                <input type="text" id="ngrokToken" name="ngrokToken" value="` + ngrokToken + `"><br><br>
                <input type="submit" value="Save">
            </form>
        </body>
        </html>  
    `);
})

app.post("/config", (req, res) => {
    let validateConfigResult = validateConfig(req.body);
    let configIsValid = validateConfigResult == '';

    if (configIsValid) {
        let ngtokenUpdated = propertiesUtilities.getProperty("ngrok", "token") != req.body.ngrokToken;

        propertiesUtilities.setProperty("webscraper", "token", req.body.webscraperToken).then(() => {
            propertiesUtilities.setProperty("database", "name", req.body.dbName).then(() => {
                propertiesUtilities.setProperty("database", "host", req.body.dbHost).then(() => {
                    propertiesUtilities.setProperty("database", "client", req.body.dbClient).then(() => {
                        propertiesUtilities.setProperty("database", "username", req.body.dbUser).then(() => {
                            propertiesUtilities.setProperty("database", "password", req.body.dbPassword).then(() => {
                                propertiesUtilities.setProperty("ngrok", "token", req.body.ngrokToken).then(() => {
                                    res.send("Config saved with success!");
                                    if (ngtokenUpdated) {
                                        connectToNgrok(req.body.ngrokToken).then(() => {}).catch(e => {
                                            console.log("Error: " + e);
                                            console.log("> Failed to connect to ngrok! Access http://localhost:" + serverPort + "/config" + " to set the config info");
                                        });
                                    }
                                })
                            })
                        })
                    })
                })
            })
        }).catch(e => res.send("Error saving the config: " + error));
    } else {
        res.send(validateConfigResult + " cannot be empty")
    }

});

app.listen(serverPort, (err) => {
    if (err) return console.log(`An error has occurred: ${err}`);
    console.log(`================ SCRAP RESPONSE MODULE STARTED! ================`);

    if (validateNgrokToken()) {
        connectToNgrok(propertiesUtilities.getProperty("ngrok", "token")).then(() => {}).catch(e => {});
    } else {
        console.log("> Access http://localhost:" + serverPort + "/config" + " to set the config info");
    }
});

function validateNgrokToken() {
    return propertiesUtilities.getProperty("ngrok", "token") != '';
}

function validateConfig(body) {
    if (body.ngrokToken == '') {
        return "Ngrok token";
    } else if (body.webscraperToken == '') {
        return "Webscraper token";
    } else if (body.dbName == '') {
        return "Database name";
    } else if (body.dbHost == '') {
        return "Database host";
    } else if (body.dbUser == '') {
        return "Database username";
    }

    return "";
}

function connectToNgrok(token) {
        return new Promise((resolve, reject) => {
            ngrok.connect({authtoken: token, addr: serverPort}).then(url => {
            console.log("> Define the url " + url + " in webscraper's webhook");
            console.log("> To configure the database and webscraper token, access " + "http://localhost:" + serverPort + "/config");
            resolve(true);
        }).catch(e => {
            console.log("> Failed to connect to ngrok! Access http://localhost:" + serverPort + "/config" + " to set the config info");
            reject(e);
        });   
    });
};

function getDbClientHtml(client) {
    let mysql2 = client == 'mysql2' ? `<option value="mysql2" selected>MySQL</option>` : `<option value="mysql2">MySQL</option>`;
    let oracledb = client == 'oracledb' ? `<option value="oracledb" selected>Oracle</option>` : `<option value="oracledb">Oracle</option>`;
    let pg = client == 'pg' ? `<option value="pg" selected>Postgres</option>` : `<option value="pg">Postgres</option>`;

    return `<label for="client"><b>Client:</b></label>
    <select name="dbClient" id="dbClient">
    ` + mysql2 + oracledb + pg + `
    </select><br><br>`
}