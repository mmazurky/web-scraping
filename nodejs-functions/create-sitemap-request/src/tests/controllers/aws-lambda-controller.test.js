import { AwsLambdaController } from "../../controllers/aws-lambda-controller.js";
import { retrieveLambdaErrorResponse, retrieveLambdaSuccessResponse } from "../../utils/aws-lambda-utilities.js";
import * as WebscraperConstants from '../../constants/webscraper-constants.js';
import nock from 'nock';
import { TestUtilities } from "../../utils/test-utilities.js";
import * as TestConstants from "../../constants/test-constants.js";

describe("AwsLambdaController tests", () => {
    let awsLambdaController;
    let createSitemapUrlPath;

    beforeAll(() => {
        // mounts the create sitemap's url path
        createSitemapUrlPath = WebscraperConstants.CREATE_SITEMAP_PATH + "?api_token=" + TestConstants.RANDOM_WEBSCRAPER_TOKEN
    })

    beforeEach(() => {
        // instantiates the controller
        awsLambdaController = new AwsLambdaController();
    })

    describe("handler function tests | handles the create sitemap request via AWS Lambda", () => {
        afterEach(() => {
            // clears nock to mock http requests
            nock.cleanAll();
        })

        it("success creating sitemap in the API: must resolve and return the response", async () => {
            let expectedSitemapId = Math.random();

            // mocks a valid function request
            let validFunctionRequest = {
                url: TestConstants.VALID_URL,
                selector: TestConstants.VALID_ELEMENT_SELECTOR,
                webscraperToken: TestConstants.RANDOM_WEBSCRAPER_TOKEN
            };

            // mocks a http response from robots.txt with sitemaps
            TestUtilities.mockRobotsWithSitemapsHttpResponse(nock, TestConstants.VALID_URL);

            // mocks a expected http success response
            let httpSuccessResponse = {
                success: true,
                data: {
                    id: expectedSitemapId
                }
            };

            // mocks the http success response when the API is called
            TestUtilities.mockHttpPostSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, createSitemapUrlPath, httpSuccessResponse);

            // sends the request
            await awsLambdaController.handler(validFunctionRequest, null).then(result => {
                let expectedSuccessResponse = retrieveLambdaSuccessResponse(expectedSitemapId);
                expect(result).toEqual(expectedSuccessResponse);
            });
        })

        it("null sitemap creation's request: must reject and return the error response", async () => {
            // sends the request
            await awsLambdaController.handler(null, null).then(result => {
                expect(result.success).toBe(false);
            });
        })

        it("error creating sitemap in the API: must reject and return the error data in response", async () => {
            // mocks a valid function request
            let validFunctionRequest = {
                url: TestConstants.VALID_URL,
                selector: TestConstants.VALID_ELEMENT_SELECTOR,
                webscraperToken: TestConstants.RANDOM_WEBSCRAPER_TOKEN
            };

            // mocks a http response from robots.txt with sitemaps
            TestUtilities.mockRobotsWithSitemapsHttpResponse(nock, TestConstants.VALID_URL);

            // mocks a expected http error response
            let httpErrorResponse = {
                success: false
            };

            // mocks the http error response when the API is called
            TestUtilities.mockHttpPostErrorResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, createSitemapUrlPath, httpErrorResponse);

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
            };

            // sends the request
            await awsLambdaController.handler(invalidFunctionRequest, null).then(result => {
                let expectedErrorResponse = retrieveLambdaErrorResponse(new Error(WebscraperConstants.INVALID_CREATE_SITEMAP_REQUEST_MESSAGE));
                expect(result).toEqual(expectedErrorResponse);
            });
        })
    })
})