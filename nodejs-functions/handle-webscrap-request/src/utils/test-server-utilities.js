import bodyParser from 'body-parser';
import { getEnvProperty } from "./properties-utilities.js";

class TestServerUtilities {
    /**
     * Validates the webscraper's token in properties file
     * @returns 
     */
    static validateWebscraperToken() {
        return getEnvProperty("WEBSCRAPER_TOKEN");
    }

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
     * Generates the HTML for Scrap request page
     * @returns 
     */
    static generateScrapHtml() {
        //retrieves the selector from properties file
        let selector = getEnvProperty("TEST_SERVER_SELECTOR");

        return `
      <!DOCTYPE html>
      <html>
        <body>
  
        <h1>Webscraping Request</h1>
  
        <form action="/scrap" method="post">
          <label for="url"><b>URL:</b></label>
          <input type="text" id="url" name="url"><br><br>
          <label for="selector"><b>Element Selector:</b></label>
          <input type="text" id="selector" name="selector" value="` + (selector != '' ? selector : "h1") + `"><br><br>
          <input type="submit" value="Submit">
        </form>
  
        </body>
      </html>`;
    }

    /**
     * Generates the HTML for Config page
     * @returns 
     */
    static generateConfigHtml() {
        //retrieves the webscraper's token from properties file
        let webscraperToken = getEnvProperty("WEBSCRAPER_TOKEN");

        return `
      <!DOCTYPE html>
      <html>
        <body>
            <form action="/config" method="post">
                <h1>Webscraper Config</h1>
                <label for="webscraperToken"><b>Webscraper Token:</b></label>
                <input type="text" id="webscraperToken" name="webscraperToken" value="` + webscraperToken + `"><br><br>
                <input type="submit" value="Save">
            </form>
        </body>
      </html>`;
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
}

export const validateWebscraperToken = TestServerUtilities.validateWebscraperToken;
export const validateConfig = TestServerUtilities.validateConfig;
export const generateScrapHtml = TestServerUtilities.generateScrapHtml;
export const generateConfigHtml = TestServerUtilities.generateConfigHtml;
export const configExpress = TestServerUtilities.configExpress;