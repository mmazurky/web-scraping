import AWS from 'aws-sdk';
import randomString from 'randomstring';
import { AwsLambdaController } from "../../controllers/aws-lambda-controller.js";
import { AWSLambdaConfig } from '../../configs/aws-lambda-config.js';
import { AWSLambdaUtilities } from "../../utils/aws-lambda-utilities.js";
import { TestUtilities } from "../../utils/test-utilities.js";
import { getEnvProperty, setEnvProperty } from "../../utils/properties-utilities.js";
import * as TestConstants from "../../constants/test-constants.js";
import * as EnvConstants from "../../constants/env-constants.js";
import * as WebscraperConstants from "../../constants/webscraper-constants.js";


describe("AwsLambdaController tests", () => {
    let awsLambdaController;
    let initialWebscraperToken;

    beforeAll(() => {
        // retrieves the WEBSCRAPER_TOKEN value
        initialWebscraperToken = getEnvProperty(EnvConstants.WEBSCRAPER_TOKEN);
    })

    beforeEach(async () => {
        // instantiates the controller
        awsLambdaController = new AwsLambdaController();
        // generates a valid webscraper token
        let webscraperToken = randomString.generate();
        // saves the webscraper token
        await setEnvProperty(EnvConstants.WEBSCRAPER_TOKEN, webscraperToken);
    })

    afterEach(async () => {
        // saves the WEBSCRAPER_TOKEN initial value to .env
        await setEnvProperty(EnvConstants.WEBSCRAPER_TOKEN, initialWebscraperToken);
    })

    describe("handler function tests | handles the create webscrap request via AWS Lambda", () => {
        it("success creating sitemap and success creating scraping job - parameter request: must resolve and return the response", async () => {
            let expectedAWSLambdaResponseArray = [];

            // mocks a valid function request
            let validFunctionRequest = {
                url: TestConstants.VALID_URL,
                selector: TestConstants.VALID_ELEMENT_SELECTOR
            };

            // mocks a valid create-sitemap-request Lambda response
            let validCreateSitemapLambdaResponse = {
                Payload: {
                    success: true,
                    sitemapId: TestConstants.RANDOM_SITEMAP_ID
                }
            };
            TestUtilities.fillMockAWSLambdaExpectedResponseArray(expectedAWSLambdaResponseArray, "create-sitemap-request", validCreateSitemapLambdaResponse);

            // mocks a valid create-scraping-job-request Lambda response
            let validCreateScrapingJobLambdaResponse = {
                Payload: {
                    success: true
                }
            };
            TestUtilities.fillMockAWSLambdaExpectedResponseArray(expectedAWSLambdaResponseArray, "create-scraping-job-request", validCreateScrapingJobLambdaResponse);

            // mocks the AWS Lambda client
            let awsLambdaClient = TestUtilities.mockAWSLambdaSyncResponse(AWS, expectedAWSLambdaResponseArray);
            // saves mocked AWS Lambda client to the singleton
            AWSLambdaConfig.getInstance().setAWSLambdaClient(awsLambdaClient);

            // sends the request
            await awsLambdaController.handler(validFunctionRequest, null).then(result => {
                let expectedSuccessResponse = AWSLambdaUtilities.retrieveLambdaSuccessResponse();
                expect(result).toEqual(expectedSuccessResponse);
            });
        })

        it("success creating sitemap and success creating scraping job - body request: must resolve and return the response", async () => {
            let expectedAWSLambdaResponseArray = [];

            // mocks a valid function request
            let validFunctionRequest = {
                body: {
                    url: TestConstants.VALID_URL,
                    selector: TestConstants.VALID_ELEMENT_SELECTOR
                }
            };

            // mocks a valid create-sitemap-request Lambda response
            let validCreateSitemapLambdaResponse = {
                Payload: {
                    success: true,
                    sitemapId: TestConstants.RANDOM_SITEMAP_ID
                }
            };
            TestUtilities.fillMockAWSLambdaExpectedResponseArray(expectedAWSLambdaResponseArray, "create-sitemap-request", validCreateSitemapLambdaResponse);

            // mocks a valid create-scraping-job-request Lambda response
            let validCreateScrapingJobLambdaResponse = {
                Payload: {
                    success: true
                }
            };
            TestUtilities.fillMockAWSLambdaExpectedResponseArray(expectedAWSLambdaResponseArray, "create-scraping-job-request", validCreateScrapingJobLambdaResponse);

            // mocks the AWS Lambda client
            let awsLambdaClient = TestUtilities.mockAWSLambdaSyncResponse(AWS, expectedAWSLambdaResponseArray);
            // saves mocked AWS Lambda client to the singleton
            AWSLambdaConfig.getInstance().setAWSLambdaClient(awsLambdaClient);

            // sends the request
            await awsLambdaController.handler(validFunctionRequest, null).then(result => {
                let expectedSuccessResponse = AWSLambdaUtilities.retrieveLambdaSuccessResponse();
                expect(result).toEqual(expectedSuccessResponse);
            });
        })

        it("error creating sitemap in the API: must reject and return the error data in response", async () => {
            let expectedAWSLambdaResponseArray = [];

            // mocks a valid function request
            let validFunctionRequest = {
                url: TestConstants.VALID_URL,
                selector: TestConstants.VALID_ELEMENT_SELECTOR
            };

            // mocks a invalid create-sitemap-request Lambda response
            let invalidCreateSitemapLambdaResponse = {
                Payload: {
                    success: false
                }
            };
            TestUtilities.fillMockAWSLambdaExpectedResponseArray(expectedAWSLambdaResponseArray, "create-sitemap-request", invalidCreateSitemapLambdaResponse);

            // mocks the AWS Lambda client
            let awsLambdaClient = TestUtilities.mockAWSLambdaSyncResponse(AWS, expectedAWSLambdaResponseArray);
            // saves mocked AWS Lambda client to the singleton
            AWSLambdaConfig.getInstance().setAWSLambdaClient(awsLambdaClient);

            // sends the request
            await awsLambdaController.handler(validFunctionRequest, null).then(result => {
                expect(result.success).toBe(false);

                let resultReason = JSON.parse(result.reason);
                expect(resultReason.function_name).toBe("create-sitemap-request");
                expect(resultReason.payload).toEqual(invalidCreateSitemapLambdaResponse.Payload);
            });
        })

        it("success creating sitemap, and error creating scraping job in the API: must reject and return the error data in response", async () => {
            let expectedAWSLambdaResponseArray = [];

            // mocks a valid function request
            let validFunctionRequest = {
                url: TestConstants.VALID_URL,
                selector: TestConstants.VALID_ELEMENT_SELECTOR
            };

            // mocks a valid create-sitemap-request Lambda response
            let validCreateSitemapLambdaResponse = {
                Payload: {
                    success: true,
                    sitemapId: TestConstants.RANDOM_SITEMAP_ID
                }
            };
            TestUtilities.fillMockAWSLambdaExpectedResponseArray(expectedAWSLambdaResponseArray, "create-sitemap-request", validCreateSitemapLambdaResponse);

            // mocks a invalid create-scraping-job-request Lambda response
            let invalidCreateScrapingJobLambdaResponse = {
                Payload: {
                    success: false
                }
            };
            TestUtilities.fillMockAWSLambdaExpectedResponseArray(expectedAWSLambdaResponseArray, "create-scraping-job-request", invalidCreateScrapingJobLambdaResponse);

            // mocks the AWS Lambda client
            let awsLambdaClient = TestUtilities.mockAWSLambdaSyncResponse(AWS, expectedAWSLambdaResponseArray);
            // saves mocked AWS Lambda client to the singleton
            AWSLambdaConfig.getInstance().setAWSLambdaClient(awsLambdaClient);

            // sends the request
            await awsLambdaController.handler(validFunctionRequest, null).then(result => {
                expect(result.success).toBe(false);

                let resultReason = JSON.parse(result.reason);
                expect(resultReason.function_name).toBe("create-scraping-job-request");
                expect(resultReason.payload).toEqual(invalidCreateScrapingJobLambdaResponse.Payload);
            });
        })

        it("webscraper token not available: must reject and return the error", async () => {
            // clears the webscraper token
            await setEnvProperty(EnvConstants.WEBSCRAPER_TOKEN, "");

            // mocks a valid function request
            let validFunctionRequest = {
                url: TestConstants.VALID_URL,
                selector: TestConstants.VALID_ELEMENT_SELECTOR
            };

            // sends the request
            await awsLambdaController.handler(validFunctionRequest, null).then(result => {
                let expectedErrorResponse = AWSLambdaUtilities.retrieveLambdaErrorResponse(new Error(WebscraperConstants.INVALID_TOKEN));
                expect(result).toEqual(expectedErrorResponse);
            });

        })
    })
})