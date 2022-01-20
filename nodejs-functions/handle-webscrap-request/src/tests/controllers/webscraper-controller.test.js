import nock from 'nock';
import { WebscraperController } from "../../controllers/webscraper-controller.js";
import { TestUtilities } from "../../utils/test-utilities.js";
import * as TestConstants from "../../constants/test-constants.js";
import * as WebscraperConstants from '../../constants/webscraper-constants.js';

describe("WebscraperController tests", () => {
    let webscraperController;

    beforeEach(() => {
        //instantiates the controller
        webscraperController = new WebscraperController();
    })

    afterEach(() => {
        // clears nock to mock http requests
        nock.cleanAll();
    })

    describe("handleWebscrapRequest function tests | handles the webscrap request", () => {
        it("success creating sitemap and success creating scraping job: must resolve and return the scraping job id", async () => {
            // random sitemap id
            let resultSitemapId = TestConstants.RANDOM_SITEMAP_ID;
            // random scraping job id
            let resultScrapingJobId = TestConstants.RANDOM_SCRAPING_JOB_ID;

            // mocks a http response from robots.txt with sitemaps
            TestUtilities.mockRobotsWithSitemapsHttpResponse(nock, TestConstants.VALID_URL);

            // mocks the http response when the API is called
            let sitemapHttpSuccessResponse = {
                success: true,
                data: {
                    id: resultSitemapId
                }
            };
            TestUtilities.mockHttpPostSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, TestUtilities.retrieveCreateSitemapWithTokenPath(), sitemapHttpSuccessResponse);

            // mocks a expected http success response
            let scrapingJobHttpSuccessResponse = {
                success: true,
                data: {
                    id: resultScrapingJobId
                }
            };
            TestUtilities.mockHttpPostSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, TestUtilities.retrieveCreateScrapingJobWithTokenPath(), scrapingJobHttpSuccessResponse);

            return webscraperController.handleWebscrapRequest(TestConstants.VALID_URL, TestConstants.VALID_ELEMENT_SELECTOR, TestConstants.RANDOM_WEBSCRAPER_TOKEN).then(result => {
                expect(result).toBe(resultScrapingJobId);
            });

        })

        it("success creating sitemap and error creating scraping job: must reject and return the error data", async () => {
            // mocks a http response from robots.txt with sitemaps
            TestUtilities.mockRobotsWithSitemapsHttpResponse(nock, TestConstants.VALID_URL);

            // mocks the http response when the API is called
            let sitemapHttpSuccessResponse = {
                success: true,
                data: {
                    id: TestConstants.RANDOM_SITEMAP_ID
                }
            };
            TestUtilities.mockHttpPostSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, TestUtilities.retrieveCreateSitemapWithTokenPath(), sitemapHttpSuccessResponse);

            // mocks a expected http error response
            let scrapingJobHttpErrorResponse = {
                success: false
            };
            TestUtilities.mockHttpPostErrorResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, TestUtilities.retrieveCreateScrapingJobWithTokenPath(), scrapingJobHttpErrorResponse);

            return webscraperController.handleWebscrapRequest(TestConstants.VALID_URL, TestConstants.VALID_ELEMENT_SELECTOR, TestConstants.RANDOM_WEBSCRAPER_TOKEN).catch(error => {
                expect(error).toEqual(scrapingJobHttpErrorResponse);
            });
        })

        it("error creating sitemap: must reject and return the error data", async () => {
            // mocks a http response from robots.txt with sitemaps
            TestUtilities.mockRobotsWithSitemapsHttpResponse(nock, TestConstants.VALID_URL);

            // mocks a expected http error response
            let sitemapHttpErrorResponse = {
                success: false
            };
            TestUtilities.mockHttpPostErrorResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, TestUtilities.retrieveCreateSitemapWithTokenPath(), sitemapHttpErrorResponse);

            return webscraperController.handleWebscrapRequest(TestConstants.VALID_URL, TestConstants.VALID_ELEMENT_SELECTOR, TestConstants.RANDOM_WEBSCRAPER_TOKEN).catch(error => {
                expect(error).toEqual(sitemapHttpErrorResponse);
            });
        })
    })
})