import * as TestConstants from "../constants/test-constants.js";
import * as WebscraperConstants from '../constants/webscraper-constants.js';

class TestUtilities {
    /**
     * Retrieves a path to create a sitemap with token
     * @returns 
     */
    static retrieveCreateSitemapWithTokenPath() {
        return WebscraperConstants.CREATE_SITEMAP_PATH + "?api_token=" + TestConstants.RANDOM_WEBSCRAPER_TOKEN;
    }

    /**
     * Mocks robots.txt content with sitemaps
     * @param {string} url 
     * @returns 
     */
    static mockRobotsTxtWithSitemaps(url) {
        let expectedSitemapArray = [url + "sitemap.xml", url + "sitemap_index.xml"];

        let robotsTxtFileContent = "User-agent: *" + "\n" + "Disallow: /config/" + "\n";
        expectedSitemapArray.forEach(sitemap => {
            robotsTxtFileContent += "Sitemap: " + sitemap + "\n";
        });

        return robotsTxtFileContent;
    }

    /**
     * Mocks Http Response of robots.txt with sitemaps
     * @param {nock} nock 
     * @param {string} url 
     */
    static mockRobotsWithSitemapsHttpResponse(nock, url) {
        let urlAux = new URL(url);
        nock(urlAux.protocol + "//" + urlAux.host)
            .persist()
            .head("/robots.txt")
            .reply(200, {});

        nock(urlAux.protocol + "//" + urlAux.host)
            .persist()
            .get("/robots.txt")
            .reply(200, TestUtilities.mockRobotsTxtWithSitemaps(url));
    }

    /**
     * Mocks Http Response of robots.txt without sitemaps
     * @param {nock} nock 
     * @param {string} url 
     */
    static mockRobotsWithoutSitemapsHttpResponse(nock, url) {
        let urlAux = new URL(url);
        nock(urlAux.protocol + "//" + urlAux.host)
            .persist()
            .head("/robots.txt")
            .reply(200, {});

        nock(urlAux.protocol + "//" + urlAux.host)
            .persist()
            .get("/robots.txt")
            .reply(200, {});
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
     * Mocks Http Response of GET with error
     * @param {nock} nock 
     * @param {string} host 
     * @param {string} path 
     * @param {*} responseBody 
     */
    static mockHttpGetErrorResponse(nock, host, path, responseBody) {
        nock(host)
            .persist()
            .post(path)
            .reply(403, responseBody);
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

    /**
     * Mocks Http Response to indicate that robots.txt exists
     * @param {nock} nock 
     * @param {string} url 
     */
    static mockHttpRobotsFileExists(nock, url) {
        TestUtilities.mockHttpPathExistsResponse(nock, TestUtilities.getUrlHost(url) + "/robots.txt");
    }

    /**
     * Mocks Http Response to indicate that robots.txt don't exist
     * @param {nock} nock 
     * @param {string} url 
     */
    static mockHttpRobotsFileNotExists(nock, url) {
        TestUtilities.mockHttpPathNotExistsResponse(nock, TestUtilities.getUrlHost(url) + "/robots.txt");
    }

    /**
     * Mocks Http Response to indicate that a path exists
     * @param {nock} nock 
     * @param {string} urlWithPath 
     */
    static mockHttpPathExistsResponse(nock, urlWithPath) {
        let host = TestUtilities.getUrlHost(urlWithPath);
        let path = TestUtilities.getUrlPath(urlWithPath);

        nock(host)
            .persist()
            .head(path)
            .reply(200, {})
    }

    /**
     * Mocks Http Response to indicate that robots.txt don't exist
     * @param {nock} nock 
     * @param {string} urlWithPath 
     */
    static mockHttpPathNotExistsResponse(nock, urlWithPath) {
        let host = TestUtilities.getUrlHost(urlWithPath);
        let path = TestUtilities.getUrlPath(urlWithPath);

        nock(host)
            .persist()
            .head(path)
            .reply(404, {})
    }

    /**
     * Gets the host from an URL
     * @param {string} url 
     * @returns 
     */
    static getUrlHost(url) {
        let urlAux = new URL(url);
        return urlAux.protocol + "//" + urlAux.host;
    }

    /**
     * Gets the path from an URL
     * @param {string} url 
     * @returns 
     */
    static getUrlPath(url) {
        let urlAux = new URL(url);
        return urlAux.pathname;
    }
}

export {
    TestUtilities
}