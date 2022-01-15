import { WebscraperController } from "../../controllers/webscraper-controller.js";
import { WEBSCRAPER_HOST, CREATE_SCRAPING_JOB_PATH, INVALID_CREATE_SCRAPING_JOB_REQUEST_MESSAGE } from '../../utils/webscraper-constants.js';
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
        createScrapingJobUrlPath = CREATE_SCRAPING_JOB_PATH + "?api_token=" + webscraperToken
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
            nock(WEBSCRAPER_HOST)
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
                    otherValue: randomString.generate()
                }
            };

            // mocks the http response when the API is called
            nock(WEBSCRAPER_HOST)
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
            nock(WEBSCRAPER_HOST)
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
            let errorMessageResponse = INVALID_CREATE_SCRAPING_JOB_REQUEST_MESSAGE;

            // sends the request
            return webscraperController.createScrapingJob(null, null).catch(error => {
                expect(error.message).toBe(errorMessageResponse);
            })
        })
    })
})