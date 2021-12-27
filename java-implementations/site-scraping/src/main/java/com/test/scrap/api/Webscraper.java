package com.test.scrap.api;


import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParser;
import com.test.scrap.utils.*;
import com.test.scrap.utils.WebscraperConstants;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;

public class Webscraper implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private static final Logger logger = LogManager.getLogger(Webscraper.class.getName());
    private String webscraperToken = "";

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent apiGatewayProxyRequestEvent, Context context) {

        try{
            context.getLogger().log("Event received: " + apiGatewayProxyRequestEvent.getBody());
            // gets the body info
            Map<String, String> requestMap = new GsonBuilder().setPrettyPrinting().create().fromJson(apiGatewayProxyRequestEvent.getBody(), Map.class);
            logger.info("body: " + apiGatewayProxyRequestEvent.getBody());
            String urlToScrap = requestMap.containsKey(WebscraperConstants.REQUEST_URL) ? requestMap.get(WebscraperConstants.REQUEST_URL) : null;
            String urlName = requestMap.containsKey(WebscraperConstants.REQUEST_URL_NAME) ? requestMap.get(WebscraperConstants.REQUEST_URL_NAME) : urlToScrap;
            String selector = requestMap.containsKey(WebscraperConstants.REQUEST_SELECTOR) ? requestMap.get(WebscraperConstants.REQUEST_SELECTOR) : null;
            String webscraperToken = requestMap.containsKey(WebscraperConstants.REQUEST_TOKEN) ? requestMap.get(WebscraperConstants.REQUEST_TOKEN) : null;


            start(urlToScrap, urlName, selector, webscraperToken);
        } catch (Exception e) {
            logger.info("An exception has occurred", e);
            return ApiUtils.defineAPIGatewayErrorResponse(e);
        }

        return ApiUtils.defineAPIGatewaySuccessResponse(apiGatewayProxyRequestEvent.getBody());
    }

    /**
     * Starts the scraping process in webscraper
     *
     * @param urlToScrap
     * @param urlNameToScrap
     * @param webscraperToken
     * @return
     */
    public void start(String urlToScrap, String urlNameToScrap, String webscraperToken, String selector) {
        // saves the webscraper token
        this.webscraperToken = webscraperToken;

        // sends the scrap request to webscraper
        sendScrapRequest(urlToScrap, urlNameToScrap, selector);
    }

    /**
     * Sends the scrap request to webscraper
     *
     * @param urlToScrap
     * @param urlNameToScrap
     */
    private void sendScrapRequest(String urlToScrap, String urlNameToScrap, String selector) {
        // creates a sitemap in scraper
        Integer sitemapId = createSitemap(urlToScrap, urlNameToScrap, selector);

        // creates a scraping job using the new sitemap id
        createScrapingJob(sitemapId);
    }

    /**
     * Creates a sitemap in webscraper
     *
     * @param urlToScrap
     * @param urlNameToScrap
     * @return
     */
    private Integer createSitemap(String urlToScrap, String urlNameToScrap, String selector) {
        try {
            // generates a unique id for the sitemap
            // it is needed to allow concurrent scrap requests for the same site
            String sitemapUniqueId = urlNameToScrap.trim().replace(" ", "_") + "-" + System.currentTimeMillis();

            // tries to retrieve the sitemaps' location from the robots.txt file or the default paths
            Set<String> sitemaps = retrieveSitemaps(urlToScrap);

            // defines the selectors to scrap the sites
            List selectorsList = new ArrayList<>();

            // if at least one sitemap was found
            if (!sitemaps.isEmpty()) {
                // adds the Selector Sitemap Xml Link
                selectorsList.add(retrieveSelectorSitemapXmlLink(sitemaps));
            }
            // adds the custom Selector Text
            selectorsList.add(retrieveCustomSelectorText(selector, !sitemaps.isEmpty()));

            // fills the http request to create a sitemap in webscraper
            HttpRequest httpRequest = new HttpRequest();
            httpRequest.getRequestJSON().put("_id", sitemapUniqueId);
            httpRequest.getRequestJSON().put("startUrl", urlToScrap);
            httpRequest.getRequestJSON().put("selectors", selectorsList);

            // sends the request to create a sitemap in webscraper
            String response = httpRequest.sendRequestWithResponse(WebscraperConstants.CREATE_SITEMAP_URL + this.webscraperToken, null, ApiConstants.METHOD.POST);

            // returns the generated sitemap id
            return JsonParser.parseString(response).getAsJsonObject().get("data").getAsJsonObject().get("id").getAsInt();
        } catch (Exception e) {
            logger.info("An exception has occurred", e);
            throw new RuntimeException("An error occurred in the creation of a sitemap in webscraper | " + e.getMessage(), e);
        }
    }

    private Set<String> retrieveSitemaps(String urlToScrap) {
        Set<String> sitemaps = new HashSet<>();

        try {
            // first tries to get the sitemap.xml info from the robots.txt file
            sitemaps.addAll(retrieveSitemapsFromRobotsFile(urlToScrap));

            // if the sitemap info is not present in robots.txt file
            if (sitemaps.isEmpty()) {
                // tries to search the sitemap.xml in the default paths
                sitemaps.addAll(retrieveSitemapsFromDefautPaths(urlToScrap));
            }
        } catch (Exception e) {
            logger.info("An exception has occurred", e);
        }

        return sitemaps;
    }

    /**
     * Creates a scraping job in webscraper
     *
     * @param sitemapId
     */
    private void createScrapingJob(Integer sitemapId) {
        try {
            // fills the Http request to create a scraping job in webscraper
            HttpRequest httpRequest = new HttpRequest();
            httpRequest.getRequestJSON().put("sitemap_id", sitemapId);
            httpRequest.getRequestJSON().put("driver", "fast"); // "fast" or "fulljs"
            httpRequest.getRequestJSON().put("page_load_delay", 2000);
            httpRequest.getRequestJSON().put("request_interval", 2000);
            httpRequest.getRequestJSON().put("proxy", 0);

            // sends the request to create a scraping job in webscraper
            String response = httpRequest.sendRequestWithResponse(WebscraperConstants.CREATE_SCRAPING_JOB_URL + webscraperToken, null, ApiConstants.METHOD.POST);

            // if it failed
            if (!JsonParser.parseString(response).getAsJsonObject().get("success").getAsBoolean()) {
                throw new RuntimeException(JsonParser.parseString(response).getAsJsonObject().get("validationErrors").getAsJsonObject().toString());
            }

        } catch (Exception e) {
            logger.info("An exception has occurred", e);
            throw new RuntimeException("An error occurred in the creation of a scraping job in webscraper | " + e.getMessage(), e);
        }
    }

    /**
     * Retrieves the sitemaps from robots.txt file
     * In most sites, the sitemap location is defined in this file
     *
     * @param urlToScrap
     * @return
     */
    private Set<String> retrieveSitemapsFromRobotsFile(String urlToScrap) {
        Set<String> sitemaps = new HashSet<>();
        try {
            // instantiates the URL class to get the elements (like protocol) separately from the URL to scrap
            URL url = new URL(urlToScrap);

            // sends the request to get the robots.txt file
            String response = new HttpRequest().sendRequestWithResponse(url.getProtocol() + "://" + url.getHost() + "/robots.txt", null, ApiConstants.METHOD.GET);

            if (StringUtils.isNotEmpty(response)) {
                // splits the response by 'line break'
                for (String element : response.split("\\r?\\n")) {
                    if (element.contains("Sitemap:")) {
                        // adds the sitemap url
                        sitemaps.add(StringUtils.deleteWhitespace(element.replace("Sitemap:", "")));
                    }
                }
            }
        } catch (Exception e) {
            logger.info("An exception has occurred", e);
            throw new RuntimeException("An error occurred in the sitemap info retrieval in robots file | " + e.getMessage(), e);
        }

        return sitemaps;
    }

    /**
     * Retrieves the sitemaps from default sitemap.xml paths
     *
     * @param urlToScrap
     * @return
     */
    private Set<String> retrieveSitemapsFromDefautPaths(String urlToScrap) {
        Set<String> sitemaps = new HashSet<>();
        try {
            // instantiates the URL class to get the elements (like protocol) separately from the URL to scrap
            URL url = new URL(urlToScrap);

            sitemaps.addAll(retrieveDefaultSitemapFilesLocation(urlToScrap).stream().filter(defaultSitemapPath -> new HttpRequest().pathExists(defaultSitemapPath, null, ApiConstants.METHOD.GET)).collect(Collectors.toList()));
        } catch (Exception e) {
            logger.info("An exception has occurred", e);
            throw new RuntimeException("An error occurred in the sitemap info retrieval in default paths | " + e.getMessage(), e);
        }

        return sitemaps;
    }


    /**
     * Retrieves the selector 'SitemapXmlLink' to be used in the sitemap creation
     * This selector receives the sitemaps to iterate over and find the URLs in the site to scrap
     *
     * @param sitemaps
     * @return
     */
    private Map<String, Object> retrieveSelectorSitemapXmlLink(Set<String> sitemaps) {
        Map selectorSitemap = new HashMap<>();

        selectorSitemap.put("id", WebscraperConstants.SITEMAP_SELECTOR_ID);
        selectorSitemap.put("type", WebscraperConstants.SITEMAP_XML_LINK_SELECTOR_TYPE);
        selectorSitemap.put("parentSelectors", Arrays.asList(WebscraperConstants.ROOT_SELECTOR_ID));
        selectorSitemap.put("sitemapXmlMinimumPriority", 0.1);
        selectorSitemap.put("sitemapXmlUrlRegex", "");
        selectorSitemap.put("sitemapXmlUrls", sitemaps);

        return selectorSitemap;
    }

    /**
     * Retrieves the selector 'SelectorText' to be used in the sitemap creation
     * This selector uses the subtitle element (h2) in the pages by default
     *
     * @return
     */
    private Map<String, Object> retrieveCustomSelectorText(String selector, boolean usesSitemapXml) {
        Map selectorText = new HashMap<>();

        selectorText.put("id", WebscraperConstants.CUSTOM_SELECTOR_ID);
        selectorText.put("type", WebscraperConstants.TEXT_SELECTOR_TYPE);
        selectorText.put("parentSelectors", usesSitemapXml ? Arrays.asList(WebscraperConstants.SITEMAP_SELECTOR_ID) : Arrays.asList(WebscraperConstants.ROOT_SELECTOR_ID));
        selectorText.put("selector", StringUtils.isNotEmpty(selector) ? selector : "h2");
        selectorText.put("multiple", true);
        selectorText.put("regex", "");
        selectorText.put("delay", 0);

        return selectorText;
    }

    /**
     * Retrieves the default sitemap files location
     *
     * @return
     */
    public List<String> retrieveDefaultSitemapFilesLocation(String urlToScrap) {
        List<String> defaultSitemapFilesLocation = new ArrayList<>();

        try {
            // instantiates the URL class to get the elements (like protocol) separately from the URL to scrap
            URL url = new URL(urlToScrap);

            return Arrays.asList(
                    url.getProtocol() + "://" + url.getHost() + "/" + "sitemap.xml",
                    url.getProtocol() + "://" + url.getHost() + "/" + "sitemap.xml.gz",
                    url.getProtocol() + "://" + url.getHost() + "/" + "sitemap_index.xml",
                    url.getProtocol() + "://" + url.getHost() + "/" + "sitemap-index.xml",
                    url.getProtocol() + "://" + url.getHost() + "/" + "sitemap_index.xml.gz",
                    url.getProtocol() + "://" + url.getHost() + "/" + "sitemap-index.xml.gz",
                    url.getProtocol() + "://" + url.getHost() + "/" + ".sitemap.xml",
                    url.getProtocol() + "://" + url.getHost() + "/" + ".sitemap",
                    url.getProtocol() + "://" + url.getHost() + "/" + "admin/config/search/xmlsitemap",
                    url.getProtocol() + "://" + url.getHost() + "/" + "sitemap/sitemap-index.xml"
            );
        } catch (Exception e) {
            logger.info("An exception occurred", e);
            return null;
        }
    }
}
