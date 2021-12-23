package com.test.scrap.api;


import com.google.gson.JsonParser;
import com.test.scrap.utils.ApiUtils;
import com.test.scrap.utils.RequestConstants;
import com.test.scrap.utils.HttpRequest;
import com.test.scrap.utils.WebscraperConstants;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.net.URL;
import java.util.*;

public class Webscraper {
    private final static Logger logger = LogManager.getLogger();
    private String webscraperToken = "";

    /**
     * Starts the scraping process in webscraper
     *
     * @param urlToScrap
     * @param urlNameToScrap
     * @param webscraperToken
     * @return
     */
    public String start(String urlToScrap, String urlNameToScrap, String webscraperToken) {
        try {
            // saves the webscraper token
            this.webscraperToken = webscraperToken;

            // sends the scrap request to webscraper
            sendScrapRequest(urlToScrap, urlNameToScrap);

            return ApiUtils.handleApiSuccessResponse();
        } catch (Exception e) {
            logger.info("An error occurred", e);
            return ApiUtils.handleApiExceptionResponse(e);
        }
    }

    /**
     * Sends the scrap request to webscraper
     *
     * @param urlToScrap
     * @param urlNameToScrap
     */
    private void sendScrapRequest(String urlToScrap, String urlNameToScrap) {
        // creates a sitemap in scraper
        Integer sitemapId = createSitemap(urlToScrap, urlNameToScrap);

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
    private Integer createSitemap(String urlToScrap, String urlNameToScrap) {
        try {
            // instantiates the URL class to get the elements (like protocol) separately from the URL to scrap
            URL url = new URL(urlToScrap);

            // generates a unique id for the sitemap
            // it is needed to allow concurrent scrap requests for the same site
            String sitemapUniqueId = urlNameToScrap.trim().replace(" ", "_") + "-" + System.currentTimeMillis();

            // tries to retrieve the sitemaps' location from the robots.txt file
            List<String> sitemapList = retrieveSitemapsFromRobotsFile(urlToScrap);

            // if the sitemaps information is not present in robots.txt
            if (sitemapList.isEmpty()) {
                for (String sitemapDefaultFile : retrieveDefaultSitemapFilesLocation()) {
                    // tries to get the sitemap files in the default sitemap.xml paths
                    sitemapList.add(url.getProtocol() + "://" + url.getHost() + "/" + sitemapDefaultFile);
                }
            }

            // defines the selectors to scrap the sites
            List selectorsList = new ArrayList<>();
            selectorsList.add(retrieveSelectorSitemapXmlLink(sitemapList));
            selectorsList.add(retrieveSubtitleSelectorText());

            // fills the http request to create a sitemap in webscraper
            HttpRequest httpRequest = new HttpRequest();
            httpRequest.getRequestJSON().put("_id", sitemapUniqueId);
            httpRequest.getRequestJSON().put("startUrl", urlToScrap);
            httpRequest.getRequestJSON().put("selectors", selectorsList);

            // sends the request to create a sitemap in webscraper
            String response = httpRequest.sendRequestWithResponse(WebscraperConstants.CREATE_SITEMAP_URL + this.webscraperToken, null, RequestConstants.METHOD.POST);

            // returns the generated sitemap id
            return JsonParser.parseString(response).getAsJsonObject().get("data").getAsJsonObject().get("id").getAsInt();
        } catch (Exception e) {
            throw new RuntimeException("An error occurred in the creation of a sitemap in webscraper | " + e.getMessage(), e);
        }
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
            String response = httpRequest.sendRequestWithResponse(WebscraperConstants.CREATE_SCRAPING_JOB_URL + webscraperToken, null, RequestConstants.METHOD.POST);

            // if it failed
            if (!JsonParser.parseString(response).getAsJsonObject().get("success").getAsBoolean()) {
                throw new RuntimeException(JsonParser.parseString(response).getAsJsonObject().get("validationErrors").getAsJsonObject().toString());
            }

        } catch (Exception e) {
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
    private List<String> retrieveSitemapsFromRobotsFile(String urlToScrap) {
        List<String> sitemapList = new ArrayList<>();
        try {
            // instantiates the URL class to get the elements (like protocol) separately from the URL to scrap
            URL urlAux = new URL(urlToScrap);

            // sends the request to get the robots.txt file
            String response = new HttpRequest().sendRequestWithResponse(urlAux.getProtocol() + "://" + urlAux.getHost() + "/robots.txt", null, RequestConstants.METHOD.GET);

            if (StringUtils.isNotEmpty(response)) {
                // splits the response by 'line break'
                for (String element : response.split("\\r?\\n")) {
                    if (element.contains("Sitemap:")) {
                        // adds the sitemap url
                        sitemapList.add(StringUtils.deleteWhitespace(element.replace("Sitemap:", "")));
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("An error occurred in the sitemap info retrieval in robots file | " + e.getMessage(), e);
        }

        return sitemapList;
    }

    /**
     * Retrieves the selector 'SitemapXmlLink' to be used in the sitemap creation
     * This selector receives the sitemaps to iterate over and find the URLs in the site to scrap
     *
     * @param sitemaps
     * @return
     */
    private Map<String, Object> retrieveSelectorSitemapXmlLink(List<String> sitemaps) {
        Map selectorSitemap = new HashMap<>();

        selectorSitemap.put("id", RequestConstants.SITEMAP_SELECTOR_ID);
        selectorSitemap.put("type", RequestConstants.SITEMAP_XML_LINK_SELECTOR_TYPE);
        selectorSitemap.put("parentSelectors", Arrays.asList(RequestConstants.ROOT_SELECTOR_ID));
        selectorSitemap.put("sitemapXmlMinimumPriority", 0.1);
        selectorSitemap.put("sitemapXmlUrlRegex", "");
        selectorSitemap.put("sitemapXmlUrls", sitemaps);

        return selectorSitemap;
    }

    /**
     * Retrieves the selector 'SelectorText' to be used in the sitemap creation
     * This selector uses the subtitle element (h2) in the pages
     *
     * @return
     */
    private Map<String, Object> retrieveSubtitleSelectorText() {
        Map selectorText = new HashMap<>();

        selectorText.put("id", RequestConstants.SUBTITLE_SELECTOR_ID);
        selectorText.put("type", RequestConstants.TEXT_SELECTOR_TYPE);
        selectorText.put("parentSelectors", Arrays.asList(RequestConstants.SITEMAP_SELECTOR_ID));
        selectorText.put("selector", "h2");
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
    public List<String> retrieveDefaultSitemapFilesLocation() {
        return Arrays.asList(
                "sitemap.xml",
                "sitemap.xml.gz",
                "sitemap_index.xml",
                "sitemap-index.xml",
                "sitemap_index.xml.gz",
                "sitemap-index.xml.gz",
                ".sitemap.xml",
                ".sitemap",
                "admin/config/search/xmlsitemap",
                "sitemap/sitemap-index.xml"
        );
    }
}
