import {
    AwsLambdaController
} from "../../controllers/aws-lambda-controller.js";
import {
    retrieveLambdaErrorResponse,
    retrieveLambdaSuccessResponse
} from "../../utils/aws-lambda-utilities.js";
import nock from 'nock';
import {
    TestUtilities
} from "../../utils/test-utilities.js";
import * as TestConstants from "../../constants/test-constants.js";
import * as WebscraperConstants from '../../constants/webscraper-constants.js';

describe("AwsLambdaController tests", () => {
    let awsLambdaController;
    let deleteScrapingJobUrlPath;
    let deleteSitemapUrlPath;

    beforeAll(() => {
        // mounts the delete scraping job's url path
        deleteScrapingJobUrlPath = TestUtilities.retrieveDeleteScrapingJobWithTokenPath();
        // mounts the delete sitemap's url path
        deleteSitemapUrlPath = TestUtilities.retrieveDeleteSitemapWithTokenPath();
    })

    beforeEach(() => {
        // instantiates the controller
        awsLambdaController = new AwsLambdaController();
    })

    describe("handler function tests | handles the delete scraping request via AWS Lambda", () => {
        afterEach(() => {
            // clears nock to mock http requests
            nock.cleanAll();
        })

        it("success deleting scraping request in the API: must resolve and return the response", async () => {
            // mocks a valid function request
            let validFunctionRequest = {
                scrapingJobId: TestConstants.RANDOM_SCRAPING_JOB_ID,
                sitemapId: TestConstants.RANDOM_SITEMAP_ID,
                webscraperToken: TestConstants.RANDOM_WEBSCRAPER_TOKEN
            };

            // mocks a expected http success response
            let httpSuccessResponse = {
                success: true
            };

            // mocks the http success response when the API is called
            TestUtilities.mockHttpDeleteSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, deleteScrapingJobUrlPath, httpSuccessResponse);

            // mocks the http success response when the API is called
            TestUtilities.mockHttpDeleteSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, deleteSitemapUrlPath, httpSuccessResponse);

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

        it("error deleting scraping in the API: must reject and return the error data in response", async () => {
            // mocks a valid function request
            let validFunctionRequest = {
                scrapingJobId: TestConstants.RANDOM_SCRAPING_JOB_ID,
                sitemapId: TestConstants.RANDOM_SITEMAP_ID,
                webscraperToken: TestConstants.RANDOM_WEBSCRAPER_TOKEN
            };

            // mocks a expected http error response
            let httpErrorResponse = {
                success: false
            };

            // mocks the http success response when the API is called
            TestUtilities.mockHttpDeleteErrorResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, deleteScrapingJobUrlPath, httpErrorResponse);

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
                let expectedErrorResponse = retrieveLambdaErrorResponse(new Error(WebscraperConstants.INVALID_DELETE_SCRAPING_REQUEST_MESSAGE));
                expect(result).toEqual(expectedErrorResponse);
            });
        })
    })
})