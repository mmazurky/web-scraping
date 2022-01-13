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
    let ngrokToken = getEnvProperty("NGROK_TOKEN");

    return `
      <!DOCTYPE html>
      <html>
      <body>
          <form action="/config" method="post">
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
   * Validates the ng's token in properties file
   * @returns 
   */
  static validateNgrokToken() {
    return getEnvProperty("NGROK_TOKEN") != '';
  }
}

export const generateConfigHtml = TestServerUtilities.generateConfigHtml;
export const configExpress = TestServerUtilities.configExpress;
export const validateConfig = TestServerUtilities.validateConfig;
export const connectToNgrok = TestServerUtilities.connectToNgrok;
export const validateNgrokToken = TestServerUtilities.validateNgrokToken;