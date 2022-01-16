import {
    WebscraperController
} from "../../controllers/webscraper-controller.js";
import nock from 'nock';
import randomString from 'randomstring';
import {
    TestUtilities
} from "../../utils/test-utilities.js";
import * as TestConstants from "../../constants/test-constants.js";
import * as WebscraperConstants from '../../constants/webscraper-constants.js';

describe("WebscraperController tests", () => {
    let webscraperController;
    let deleteScrapingJobUrlPath;
    let deleteSitemapUrlPath;

    beforeAll(() => {
        // mounts the delete scraping job's url path
        deleteScrapingJobUrlPath = TestUtilities.retrieveDeleteScrapingJobWithTokenPath();
        // mounts the delete sitemap's url path
        deleteSitemapUrlPath = TestUtilities.retrieveDeleteSitemapWithTokenPath();
    })

    beforeEach(() => {
        //instantiates the controller
        webscraperController = new WebscraperController();
    })

    describe("deleteScraping function tests | deletes a scraping request", () => {
        afterEach(() => {
            // clears nock to mock http requests
            nock.cleanAll();
        })

        it("valid response deleting a scraping request: must resolve and return true", () => {
            // mocks a valid function request
            let scrapingJobId = TestConstants.RANDOM_SCRAPING_JOB_ID;
            let sitemapId = TestConstants.RANDOM_SITEMAP_ID;
            let webscraperToken = TestConstants.RANDOM_WEBSCRAPER_TOKEN;

            // mocks a expected http success response
            let httpSuccessResponse = {
                success: true
            };
            // mocks the http success response when the API is called
            TestUtilities.mockHttpDeleteSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, deleteScrapingJobUrlPath, httpSuccessResponse);
            TestUtilities.mockHttpDeleteSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, deleteSitemapUrlPath, httpSuccessResponse);

            // sends the request
            return webscraperController.deleteScraping(scrapingJobId, sitemapId, webscraperToken).then(result => {
                expect(result).toBe(true);
            });
        });

        it("invalid API status deleting a scraping job: must reject and return the response", () => {
            // mocks a valid function request
            let scrapingJobId = TestConstants.RANDOM_SCRAPING_JOB_ID;
            let sitemapId = TestConstants.RANDOM_SITEMAP_ID;
            let webscraperToken = TestConstants.RANDOM_WEBSCRAPER_TOKEN;

            // mocks the http error response when the API is called
            let httpErrorResponse = {
                success: false
            };
            TestUtilities.mockHttpDeleteErrorResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, deleteScrapingJobUrlPath, httpErrorResponse);

            //sends the request
            return webscraperController.deleteScraping(scrapingJobId, sitemapId, webscraperToken).catch(error => {
                expect(error).toEqual(httpErrorResponse);
            });
        });

        it("valid API status deleting a scraping job, but no success indicator in its response: must reject and return the response", () => {
            // mocks a valid function request
            let scrapingJobId = TestConstants.RANDOM_SCRAPING_JOB_ID;
            let sitemapId = TestConstants.RANDOM_SITEMAP_ID;
            let webscraperToken = TestConstants.RANDOM_WEBSCRAPER_TOKEN;

            // mocks the http invalid response when the API is called
            let httpInvalidResponse = {
                randomKey: randomString.generate()
            };
            TestUtilities.mockHttpDeleteSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, deleteScrapingJobUrlPath, httpInvalidResponse);

            //sends the request
            return webscraperController.deleteScraping(scrapingJobId, sitemapId, webscraperToken).catch(error => {
                expect(error).toEqual(httpInvalidResponse);
            });
        });

        it("valid API status deleting a scraping job and valid API status deleting a sitemap, but no success indicator in the sitemap's response: must reject and return the response", () => {
            // mocks a valid function request
            let scrapingJobId = TestConstants.RANDOM_SCRAPING_JOB_ID;
            let sitemapId = TestConstants.RANDOM_SITEMAP_ID;
            let webscraperToken = TestConstants.RANDOM_WEBSCRAPER_TOKEN;

            // mocks a expected http success response
            let httpSuccessResponse = {
                success: true
            };
            // mocks the http success response when the API is called
            TestUtilities.mockHttpDeleteSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, deleteScrapingJobUrlPath, httpSuccessResponse);
            // mocks the http invalid response when the API is called
            let httpInvalidResponse = {
                randomKey: randomString.generate()
            };
            TestUtilities.mockHttpDeleteSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, deleteSitemapUrlPath, httpInvalidResponse);

            //sends the request
            return webscraperController.deleteScraping(scrapingJobId, sitemapId, webscraperToken).catch(error => {
                expect(error).toEqual(httpInvalidResponse);
            });
        });

        it("valid API status deleting a scraping job, but invalid API status deleting a sitemap: must reject and return the response", () => {
            // mocks a valid function request
            let scrapingJobId = TestConstants.RANDOM_SCRAPING_JOB_ID;
            let sitemapId = TestConstants.RANDOM_SITEMAP_ID;
            let webscraperToken = TestConstants.RANDOM_WEBSCRAPER_TOKEN;

            // mocks the http success response when the API is called
            let httpSuccessResponse = {
                success: true
            };
            TestUtilities.mockHttpDeleteSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, deleteScrapingJobUrlPath, httpSuccessResponse);
            
            // mocks the http error response when the API is called
            let httpErrorResponse = {
                success: false
            };
            TestUtilities.mockHttpDeleteSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, deleteSitemapUrlPath, httpSuccessResponse);

            //sends the request
            return webscraperController.deleteScraping(scrapingJobId, sitemapId, webscraperToken).catch(error => {
                expect(error).toEqual(httpErrorResponse);
            });
        });

        it("mandatory fields not filled: must reject and return the error", () => {
            // expected error message
            let errorMessageResponse = WebscraperConstants.INVALID_DELETE_SCRAPING_REQUEST_MESSAGE;

            // sends the request
            return webscraperController.deleteScraping(null, null, null).catch(error => {
                expect(error.message).toBe(errorMessageResponse);
            })
        })
    })

    describe("validateDeleteScrapingRequest function tests | validates the request to delete a scraping request", () => {
        it("all mandatory fields filled: must return true", () => {
            let result = webscraperController.validateDeleteScrapingRequest(TestConstants.RANDOM_SCRAPING_JOB_ID, TestConstants.RANDOM_SITEMAP_ID, TestConstants.RANDOM_WEBSCRAPER_TOKEN);

            expect(result).toBe(true);
        })

        it("all mandatory fields not filled: must throw a 'invalid delete scraping request' error", () => {
            let expectedError = new Error(WebscraperConstants.INVALID_DELETE_SCRAPING_REQUEST_MESSAGE);

            expect(() => webscraperController.validateDeleteScrapingRequest(null, null, null)).toThrow(expectedError);
        })

        it("scrapingJobId field not filled: must throw a 'invalid delete scraping request' error", () => {
            let expectedError = new Error(WebscraperConstants.INVALID_DELETE_SCRAPING_REQUEST_MESSAGE);

            expect(() => webscraperController.validateDeleteScrapingRequest(null, TestConstants.RANDOM_SITEMAP_ID, TestConstants.RANDOM_WEBSCRAPER_TOKEN)).toThrow(expectedError);
        })

        it("sitemapId field not filled: must throw a 'invalid delete scraping request' error", () => {
            let expectedError = new Error(WebscraperConstants.INVALID_DELETE_SCRAPING_REQUEST_MESSAGE);

            expect(() => webscraperController.validateDeleteScrapingRequest(TestConstants.RANDOM_SCRAPING_JOB_ID, null, TestConstants.RANDOM_WEBSCRAPER_TOKEN)).toThrow(expectedError);
        })

        it("webscraperToken field not filled: must throw a 'invalid delete scraping request' error", () => {
            let expectedError = new Error(WebscraperConstants.INVALID_DELETE_SCRAPING_REQUEST_MESSAGE);

            expect(() => webscraperController.validateDeleteScrapingRequest(TestConstants.RANDOM_SCRAPING_JOB_ID, TestConstants.RANDOM_SITEMAP_ID, null)).toThrow(expectedError);
        })
    })
})