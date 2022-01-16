import { AwsLambdaController } from "../../controllers/aws-lambda-controller.js";
import { retrieveLambdaErrorResponse, retrieveLambdaSuccessResponse } from "../../utils/aws-lambda-utilities.js";
import * as WebscraperConstants from '../../constants/webscraper-constants.js';
import nock from 'nock';
import randomString from 'randomstring';

describe("AwsLambdaController tests", () => {
    let awsLambdaController;
    let webscraperToken;
    let createScrapingJobUrlPath;

    beforeAll(() => {
        // generates a random token
        webscraperToken = randomString.generate();
        // mounts the create scraping job's url path
        createScrapingJobUrlPath = WebscraperConstants.CREATE_SCRAPING_JOB_PATH + "?api_token=" + webscraperToken
    })

    beforeEach(() => {
        // instantiates the controller
        awsLambdaController = new AwsLambdaController();
    })

    describe("handler function tests | handles the create scraping request via AWS Lambda", () => {
        afterEach(() => {
            // clears nock to mock http requests
            nock.cleanAll();
        })

        it("success creating scraping job in the API: must resolve and return the response", async () => {
            // mocks a valid function request
            let validFunctionRequest = {
                sitemapId: Math.random(),
                webscraperToken: webscraperToken
            };

            // mocks a expected http success response
            let httpSuccessResponse = {
                success: true,
                data: {
                    id: Math.random()
                }
            };

            // mocks the http error response when the API is called
            nock(WebscraperConstants.WEBSCRAPER_HOST)
                .persist()
                .post(createScrapingJobUrlPath)
                .reply(200, httpSuccessResponse);


            // sends the request
            await awsLambdaController.handler(validFunctionRequest, null).then(result => {
                let expectedSuccessResponse = retrieveLambdaSuccessResponse();
                expect(result).toEqual(expectedSuccessResponse);
            });
        })

        it("null scraping job creation's request: must reject and return the error response", async () => {
            // sends the request
            await awsLambdaController.handler(null, null).then(result => {
                expect(result.success).toBe(false);
            });
        })

        it("error creating scraping job in the API: must reject and return the error data in response", async () => {
            // mocks a valid function request
            let validFunctionRequest = {
                sitemapId: Math.random(),
                webscraperToken: webscraperToken
            };

            // mocks a expected http error response
            let httpErrorResponse = {
                success: false
            };

            // mocks the http error response when the API is called
            nock(WebscraperConstants.WEBSCRAPER_HOST)
                .persist()
                .post(createScrapingJobUrlPath)
                .reply(400, httpErrorResponse);

            // sends the request
            await awsLambdaController.handler(validFunctionRequest, null).then(result => {
                let expectedErrorResponse = retrieveLambdaErrorResponse(new Error(JSON.stringify(httpErrorResponse)));
                expect(result).toEqual(expectedErrorResponse);
            });
        })

        it("mandatory fields not filled: must reject and return the error data in response", async () => {
            // mocks a invalid function request
            let invalidFunctionRequest = {
                randomKey1: "",
                randomKey2: ""
            };

            // sends the request
            await awsLambdaController.handler(invalidFunctionRequest, null).then(result => {
                let expectedErrorResponse = retrieveLambdaErrorResponse(new Error(WebscraperConstants.INVALID_CREATE_SCRAPING_JOB_REQUEST_MESSAGE));
                expect(result).toEqual(expectedErrorResponse);
            });
        })
    })
})