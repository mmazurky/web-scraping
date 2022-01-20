import { WEBSCRAPER_TOKEN } from "./env-constants.js"

// webscraper constants
export const WEBSCRAPER_HOST = "https://api.webscraper.io";
export const CREATE_SITEMAP_PATH = "/api/v1/sitemap";
export const CREATE_SCRAPING_JOB_PATH = "/api/v1/scraping-job";

// api messages
export const INVALID_CREATE_SITEMAP_REQUEST_MESSAGE = "You must fill in all mandatory fields: url, selector and webscraperToken";
export const INVALID_TOKEN = "Webscraper Token not provided - its value must be provided in " + WEBSCRAPER_TOKEN + " environment variable";