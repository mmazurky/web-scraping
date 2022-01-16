import { WebscraperController } from "../../controllers/webscraper-controller.js";
import { TestUtilities} from "../../utils/test-utilities.js"
import * as WebscraperConstants from '../../constants/webscraper-constants.js';
import * as TestConstants from '../../constants/test-constants.js';
import nock from 'nock';
import randomString from 'randomstring';

describe("WebscraperController tests", () => {
    let webscraperController;
    let createScrapingJobUrlPath;

    beforeAll(() => {
        // mounts the create scraping job's url path
        createScrapingJobUrlPath = TestUtilities.retrieveCreateScrapingJobWithTokenPath();
    })

    beforeEach(() => {
        //instantiates the controller
        webscraperController = new WebscraperController();
    })

    describe("createScrapingJob function tests | creates a scraping job", () => {
        afterEach(() => {
            // clears nock to mock http requests
            nock.cleanAll();
        })

        it("valid response creating a scraping job: must resolve and return the scraping job id", () => {
            // random scraping job id
            let resultScrapingJobId = TestConstants.RANDOM_SCRAPING_JOB_ID;

            // mocks a expected http success response
            let httpSuccessResponse = {
                success: true,
                data: {
                    id: resultScrapingJobId
                }
            };
            TestUtilities.mockHttpPostSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, createScrapingJobUrlPath, httpSuccessResponse);

            // sends the request
            return webscraperController.createScrapingJob(TestConstants.RANDOM_SITEMAP_ID, TestConstants.RANDOM_WEBSCRAPER_TOKEN).then(result => {
                expect(result).toBe(resultScrapingJobId);
            });
        });

        it("valid API status, but no scraping job id returned: must reject and return the response", () => {
            // mocks a expected success http response without the scraping job id
            let httpSuccessResponseWithoutId = {
                success: true,
                data: {
                    randomKey: randomString.generate()
                }
            };
            TestUtilities.mockHttpPostSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, createScrapingJobUrlPath, httpSuccessResponseWithoutId);
            

            //sends the request
            return webscraperController.createScrapingJob(TestConstants.RANDOM_SITEMAP_ID, TestConstants.RANDOM_WEBSCRAPER_TOKEN).catch(error => {
                expect(error).toEqual(httpSuccessResponseWithoutId);
            });
        });

        it("invalid API status creating a scraping job: must reject and return the response", () => {
            // mocks the http error response when the API is called
            let httpErrorResponse = {
                success: false
            };          
            TestUtilities.mockHttpPostErrorResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, createScrapingJobUrlPath, httpErrorResponse);

            //sends the request
            return webscraperController.createScrapingJob(TestConstants.RANDOM_SITEMAP_ID, TestConstants.RANDOM_WEBSCRAPER_TOKEN).catch(error => {
                expect(error).toEqual(httpErrorResponse);
            });
        });

        it("mandatory fields not filled: must reject and return the error", () => {
            // expected error message
            let errorMessageResponse = WebscraperConstants.INVALID_CREATE_SCRAPING_JOB_REQUEST_MESSAGE;

            // sends the request
            return webscraperController.createScrapingJob(null, null).catch(error => {
                expect(error.message).toBe(errorMessageResponse);
            })
        })
    })

    describe("validateCreateScrapingJobRequest function tests | validates the request to create a sitemap", () => {
        it("all mandatory fields filled: must return true", () => {
            let result = webscraperController.validateCreateScrapingJobRequest(TestConstants.RANDOM_SITEMAP_ID, TestConstants.RANDOM_WEBSCRAPER_TOKEN);

            expect(result).toBe(true);
        })

        it("all mandatory fields not filled: must throw a 'invalid create sitemap request' error", () => {
            let expectedError = new Error(WebscraperConstants.INVALID_CREATE_SCRAPING_JOB_REQUEST_MESSAGE);

            expect(() => webscraperController.validateCreateScrapingJobRequest(null, null)).toThrow(expectedError);
        })

        it("sitemapId field not filled: must throw a 'invalid create sitemap request' error", () => {
            let expectedError = new Error(WebscraperConstants.INVALID_CREATE_SCRAPING_JOB_REQUEST_MESSAGE);

            expect(() => webscraperController.validateCreateScrapingJobRequest(null, TestConstants.RANDOM_WEBSCRAPER_TOKEN)).toThrow(expectedError);
        })

        it("webscraperToken field not filled: must throw a 'invalid create sitemap request' error", () => {
            let expectedError = new Error(WebscraperConstants.INVALID_CREATE_SCRAPING_JOB_REQUEST_MESSAGE);

            expect(() => webscraperController.validateCreateScrapingJobRequest(TestConstants.RANDOM_SITEMAP_ID, null)).toThrow(expectedError);
        })
    })
})