import {
  getProperty
} from "./properties-utilities.js";
import bodyParser from 'body-parser';
import {
  getEnvProperty
} from "./properties-utilities.js";
import { connect } from 'ngrok';

class TestServerUtilities {
  /**
   * Validates the config update
   * @param {*} body 
   * @returns 
   */
  static validateConfig(body) {
    if (body.webscraperToken == '') {
      return "Webscraper token";
    }

    return "";
  }

  /**
   * Generates the HTML for Config page
   * @returns 
   */
  static generateConfigHtml() {
    //retrieves each property from its properties file
    let webscraperToken = getEnvProperty("WEBSCRAPER_TOKEN")
    let dbClient = getProperty("database", "client");
    let dbName = getProperty("database", "name");
    let dbHost = getProperty("database", "host");
    let dbUser = getProperty("database", "username");
    let dbPassword = getProperty("database", "password");
    let ngrokToken = getProperty("ngrok", "token");

    //gets the generated db client' select html
    let dbClientHtml = generateDbClientSelectHtml(dbClient);

    return `
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
  `;
  }

  /**
   * Configs the express
   * @returns 
   */
  static configExpress(app) {
    //to support JSON-encoded bodies
    app.use(bodyParser.json());
    //to support URL-encoded bodies
    app.use(bodyParser.urlencoded({
      extended: true
    }));
  }

  /**
   * Validates the config update
   * @param {*} body 
   * @returns 
   */
  static validateConfig(body) {
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

  /**
   * Connects to ngrok
   * @param {string} token 
   * @returns 
   */
  static connectToNgrok(token, serverPort) {
    return new Promise((resolve, reject) => {
      connect({
        authtoken: token,
        addr: serverPort
      }).then(url => {
        console.log("> Define the url " + url + "/result" + " in webscraper's webhook");
        console.log("> To configure the database and webscraper token, access " + "http://localhost:" + serverPort + "/config");
        resolve(true);
      }).catch(e => {
        console.log("> Failed to connect to ngrok! Access http://localhost:" + serverPort + "/config" + " to set the config info");
        reject(e);
      });
    });
  };

  /**
   * Generates the HTML for DB Client Select
   * @param {string} client 
   * @returns 
   */
  static generateDbClientSelectHtml(client) {
    let mysql2 = client == 'mysql2' ? `<option value="mysql2" selected>MySQL</option>` : `<option value="mysql2">MySQL</option>`;
    let oracledb = client == 'oracledb' ? `<option value="oracledb" selected>Oracle</option>` : `<option value="oracledb">Oracle</option>`;
    let pg = client == 'pg' ? `<option value="pg" selected>Postgres</option>` : `<option value="pg">Postgres</option>`;

    return `<label for="client"><b>Client:</b></label>
  <select name="dbClient" id="dbClient">
  ` + mysql2 + oracledb + pg + `
  </select><br><br>`
  }

  /**
   * Validates the ng's token in properties file
   * @returns 
   */
  static validateNgrokToken() {
    return getProperty("ngrok", "token") != '';
  }
}

export const generateConfigHtml = TestServerUtilities.generateConfigHtml;
export const configExpress = TestServerUtilities.configExpress;
export const validateConfig = TestServerUtilities.validateConfig;
export const connectToNgrok = TestServerUtilities.connectToNgrok;
export const generateDbClientSelectHtml = TestServerUtilities.generateDbClientSelectHtml;
export const validateNgrokToken = TestServerUtilities.validateNgrokToken;