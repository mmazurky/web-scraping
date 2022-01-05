//initializes the libraries
const main = require("./index");
const express = require('express');
const app = express();
const propertiesUtilities = require("./lib/properties-utilities");

// defines the server port
const serverPort = propertiesUtilities.getProperty("server", "port");

//to support JSON-encoded bodies
app.use(bodyParser.json());
//to support URL-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
}));

/**
 * http route: request test page
 */
app.get("/scrap", (req, res) => {
  //shows generated scrap page
  res.send(generateScrapHtml());
});

/**
 * http route: performs the scrap request
 */
app.post("/scrap", (req, res) => {
  //retrieves the webscraper's token from properties file
  let webscraperToken = propertiesUtilities.getProperty("webscraper", "token");

  //sends the scraping request
  main.sendScrapingRequest(req.body.url, req.body.selector, webscraperToken).then(scrapingJobId => {
    //response
    res.send({
      "success": "true",
      "scraping_job_id": scrapingJobId
    });
  }).catch(e => {
    console.log("An error has occurred: " + e);
    //response
    res.send({
      "success": "false",
      "reason": e
    });
  });

  //saves the selector value to properties file
  propertiesUtilities.setProperty("webscraper", "selector", req.body.selector).then(() => {}).catch(e => {});
});

/**
 * http route: config page
 */
app.get("/config", (req, res) => {
  //shows generated config page
  res.send(generateConfigHtml());
})

/**
 * http update the configs
 */
app.post("/config", (req, res) => {
  //validates the config update's request
  let validateConfigResult = validateConfig(req.body);
  let configIsValid = validateConfigResult == '';

  if (configIsValid) {
    //retrieves the webscraper's token from the properties file
    propertiesUtilities.setProperty("webscraper", "token", req.body.webscraperToken).then(() => {
      //response
      res.send({
        "success": "true"
      });
    }).catch(e => {
      //response
      res.send({
        "success": "false",
        "reason": error
      });
    });
  } else {
    //response
    res.send({
      "success": "false",
      "reason": validateConfigResult + " cannot be empty"
    });
  }

});

/**
 * Starts the server
 */
app.listen(serverPort, () => {
  console.log(`================ SCRAP REQUEST MODULE STARTED! ================`);

  //validates if the webscraper's token is filled in properties file
  if (!validateWebscraperToken()) {
    console.log("> A webscraper token is needed to perform the tests. You must set it in the config page.")
  }

  console.log("> To configure the webscraper token, access " + "http://localhost:" + serverPort + "/config");
  console.log("> Access http://localhost:" + serverPort + "/scrap for tests");
});

/**
 * Validates the webscraper's token in properties file
 * @returns 
 */
function validateWebscraperToken() {
  return propertiesUtilities.getProperty("webscraper", "token") != '';
}

/**
 * Validates the config update
 * @param {*} body 
 * @returns 
 */
function validateConfig(body) {
  if (body.webscraperToken == '') {
    return "Webscraper token";
  }

  return "";
}

/**
 * Generates the HTML for Scrap request page
 * @returns 
 */
function generateScrapHtml() {
  //retrieves the selector from properties file
  let selector = propertiesUtilities.getProperty("webscraper", "selector");

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
function generateConfigHtml() {
  //retrieves the webscraper's token from properties file
  let webscraperToken = propertiesUtilities.getProperty("webscraper", "token");

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