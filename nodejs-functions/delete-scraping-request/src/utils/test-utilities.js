import * as TestConstants from "../constants/test-constants.js";
import * as WebscraperConstants from '../constants/webscraper-constants.js';

class TestUtilities {
    /**
     * Retrieves a path to delete a scraping job with token
     * @returns 
     */
     static retrieveDeleteScrapingJobWithTokenPath() {
        return WebscraperConstants.DELETE_SCRAPING_JOB_PATH + "/" + TestConstants.RANDOM_SCRAPING_JOB_ID + "?api_token=" + TestConstants.RANDOM_WEBSCRAPER_TOKEN;
    }

    /**
     * Retrieves a path to delete a sitemap with token
     * @returns 
     */
    static retrieveDeleteSitemapWithTokenPath() {
        return WebscraperConstants.DELETE_SITEMAP_PATH + "/" + TestConstants.RANDOM_SITEMAP_ID + "?api_token=" + TestConstants.RANDOM_WEBSCRAPER_TOKEN;
    }

    /**
     * Mocks Http Response of delete with success
     * @param {nock} nock 
     * @param {string} host 
     * @param {string} path 
     * @param {*} responseBody 
     */
     static mockHttpDeleteSuccessResponse(nock, host, path, responseBody) {
        nock(host)
            .persist()
            .delete(path)
            .reply(200, responseBody);
    }

    /**
     * Mocks Http Response of DELETE with error
     * @param {nock} nock 
     * @param {string} host 
     * @param {string} path 
     * @param {*} responseBody 
     */
     static mockHttpDeleteErrorResponse(nock, host, path, responseBody) {
        nock(host)
            .persist()
            .delete(path)
            .reply(403, responseBody);
    }
}

export {
    TestUtilities
}