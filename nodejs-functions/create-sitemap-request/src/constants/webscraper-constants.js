// webscraper constants
export const WEBSCRAPER_HOST = "https://api.webscraper.io";
export const CREATE_SITEMAP_PATH = "/api/v1/sitemap";

// api messages
export const INVALID_CREATE_SITEMAP_REQUEST_MESSAGE = "You must fill in all mandatory fields: url, selector and webscraperToken";

// create sitemap body config
export const INITIAL_CREATE_SITEMAP_REQUEST_BODY_CONFIG = {
    "_id": "",
    "startUrl": [],
    "selectors": []
};

// selectors: custom selector
export const INITIAL_CUSTOM_SELECTOR_CONFIG = {
    "id": "custom",
    "type": "SelectorText",
    "multiple": true,
    "regex": "",
    "delay": 0,
};
export const CUSTOM_SELECTOR_SINGLE_PAGE_SELECTORS = "_root";
export const CUSTOM_SELECTOR_SITEMAP_SELECTORS = "sitemap";
export const CUSTOM_SELECTOR_DEFAULT_SELECTOR = "h2";

// selectors: sitemap xml link
export const INITIAL_SELECTOR_SITEMAP_XML_LINK_CONFIG = {
    "id": "sitemap",
    "type": "SelectorSitemapXmlLink",
    "parentSelectors": [
        "_root"
    ],
    "sitemapXmlMinimumPriority": 0.1,
    "sitemapXmlUrlRegex": ""
}
