import * as TestConstants from "../constants/test-constants.js";
import * as WebscraperConstants from '../constants/webscraper-constants.js';

class TestUtilities {
    /**
     * Retrieves a path to create a sitemap with token
     * @returns 
     */
    static retrieveCreateScrapingJobWithTokenPath() {
        return WebscraperConstants.CREATE_SCRAPING_JOB_PATH + "?api_token=" + TestConstants.RANDOM_WEBSCRAPER_TOKEN;
    }

    /**
     * Mocks Http Response of POST with success
     * @param {nock} nock 
     * @param {string} host 
     * @param {string} path 
     * @param {*} responseBody 
     */
    static mockHttpPostSuccessResponse(nock, host, path, responseBody) {
        nock(host)
            .persist()
            .post(path)
            .reply(200, responseBody);
    }

    /**
     * Mocks Http Response of POST with error
     * @param {nock} nock 
     * @param {string} host 
     * @param {string} path 
     * @param {*} responseBody 
     */
    static mockHttpPostErrorResponse(nock, host, path, responseBody) {
        nock(host)
            .persist()
            .post(path)
            .reply(400, responseBody);
    }
}

export {
    TestUtilities
}