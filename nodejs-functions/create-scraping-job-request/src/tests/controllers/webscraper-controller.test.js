import { WebscraperController } from "../../controllers/webscraper-controller.js";
import * as WebscraperConstants from '../../constants/webscraper-constants.js';
import nock from 'nock';
import randomString from 'randomstring';

describe("WebscraperController tests", () => {
    let webscraperController;
    let webscraperToken;
    let createScrapingJobUrlPath;

    beforeAll(() => {
        // generates a random token
        webscraperToken = randomString.generate();
        // mounts the create scraping job's url path
        createScrapingJobUrlPath = WebscraperConstants.CREATE_SCRAPING_JOB_PATH + "?api_token=" + webscraperToken
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
            // generates a random scraping job id
            let resultScrapingJobId = Math.random();

            // mocks a expected http success response
            let httpSuccessResponse = {
                success: true,
                data: {
                    id: resultScrapingJobId
                }
            };

            // mocks the http response when the API is called
            nock(WebscraperConstants.WEBSCRAPER_HOST)
                .persist()
                .post(createScrapingJobUrlPath)
                .reply(200, httpSuccessResponse);

            // sends the request
            return webscraperController.createScrapingJob(Math.random(), webscraperToken).then(result => {
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

            // mocks the http response when the API is called
            nock(WebscraperConstants.WEBSCRAPER_HOST)
                .persist()
                .post(createScrapingJobUrlPath)
                .reply(200, httpSuccessResponseWithoutId);

            //sends the request
            return webscraperController.createScrapingJob(Math.random(), webscraperToken).catch(error => {
                expect(error).toEqual(httpSuccessResponseWithoutId);
            });
        });

        it("invalid API status creating a scraping job: must reject and return the response", () => {
            // mocks a expected http error response
            let httpErrorResponse = {
                success: false
            };

            // mocks the http error response when the API is called
            nock(WebscraperConstants.WEBSCRAPER_HOST)
                .persist()
                .post(createScrapingJobUrlPath)
                .reply(400, httpErrorResponse);

            //sends the request
            return webscraperController.createScrapingJob(Math.random(), webscraperToken).catch(error => {
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
        it("all mandatory fields not filled: must throw a 'invalid create sitemap request' error", () => {
            let expectedError = new Error(WebscraperConstants.INVALID_CREATE_SCRAPING_JOB_REQUEST_MESSAGE);

            expect(() => webscraperController.validateCreateScrapingJobRequest(null, null)).toThrow(expectedError);
        })

        it("sitemapId field not filled: must throw a 'invalid create sitemap request' error", () => {
            let expectedError = new Error(WebscraperConstants.INVALID_CREATE_SCRAPING_JOB_REQUEST_MESSAGE);

            expect(() => webscraperController.validateCreateScrapingJobRequest(null, "webscraperToken")).toThrow(expectedError);
        })

        it("webscraperToken field not filled: must throw a 'invalid create sitemap request' error", () => {
            let expectedError = new Error(WebscraperConstants.INVALID_CREATE_SCRAPING_JOB_REQUEST_MESSAGE);

            expect(() => webscraperController.validateCreateScrapingJobRequest("sitemapId", null)).toThrow(expectedError);
        })
    })
})