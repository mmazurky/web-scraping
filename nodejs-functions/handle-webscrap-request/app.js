const main = require("./index");
var express = require('express');
const app = express();
const propertiesUtilities = require("./lib/properties-utilities");
const bodyParser = require('body-parser');

const serverPort = 5000;

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.get("/scrap", (req, res) => {
    res.send(`
    <!DOCTYPE html>
<html>
<body>

<h1>Webscraping Request</h1>

<form action="/scrap" method="post">
  <label for="url"><b>URL:</b></label>
  <input type="text" id="url" name="url"><br><br>
  <label for="selector"><b>Element Selector:</b></label>
  <input type="text" id="selector" name="selector" value="h1"><br><br>
  <input type="submit" value="Submit">
</form>

</body>
</html>
   
`);
});

app.post("/scrap", (req, res) => {
  let webscraperToken = propertiesUtilities.getProperty("webscraper", "token");

    main.sendScrapingRequest(req.body.url, req.body.selector, webscraperToken).then(scrapingJobId => res.send("Scraping Request finished with success! Scraping Job Id: " + scrapingJobId)).catch(e => {
        console.log("An error has occurred: " + e);
        res.send("An error has occurred: " + e);
    });
});

app.get("/config", (req,res) => {
  let webscraperToken = propertiesUtilities.getProperty("webscraper", "token");

  res.send(`
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
      </html>  
  `);
})

app.post("/config", (req, res) => {
  let validateConfigResult = validateConfig(req.body);
  let configIsValid = validateConfigResult == '';

  if (configIsValid) {
      propertiesUtilities.setProperty("webscraper", "token", req.body.webscraperToken).then(() => {
        res.send("Config saved with success!");
      }).catch(e => res.send("Error saving the config: " + error));
  } else {
      res.send(validateConfigResult + " cannot be empty")
  }

});

app.listen(serverPort, () => {
    console.log(`================ SCRAP REQUEST MODULE STARTED! ================`);

    if (!validateWebscraperToken()) {
      console.log("> A webscraper token is needed to perform the tests. You must set it in the config page.")
    }

    console.log("> To configure the webscraper token, access " + "http://localhost:" + serverPort + "/config");
    console.log("> Access http://localhost:" + serverPort + "/scrap for tests");
});

function validateWebscraperToken() {
  return propertiesUtilities.getProperty("webscraper", "token") != '';
}

function validateConfig(body) {
  if (body.webscraperToken == '') {
      return "Webscraper token";
  }

  return "";
}
