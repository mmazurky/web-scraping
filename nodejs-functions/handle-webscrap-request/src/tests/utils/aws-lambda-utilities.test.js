import AWS from 'aws-sdk';
import randomString from 'randomstring';
import { AWSLambdaConfig } from '../../configs/aws-lambda-config.js';
import { AWSLambdaUtilities } from "../../utils/aws-lambda-utilities.js";
import { TestUtilities } from "../../utils/test-utilities.js";

describe("aws-lambda-utilities tests", () => {
    describe("retrieveLambdaErrorResponse function tests | returns a formatted error response", () => {
        it("object error with message in request | must return an object with error data, including the error message", () => {
            // mocks an error object with message
            let errorObjectWithMessage = {
                message: "Test message"
            };

            // expected function error response
            let expectedFunctionErrorResponse = {
                status: 400,
                success: false,
                reason: errorObjectWithMessage.message
            };

            expect(AWSLambdaUtilities.retrieveLambdaErrorResponse(errorObjectWithMessage)).toEqual(expectedFunctionErrorResponse);
        })

        it("object error without message in request | must return an object with error data, including the stringified error object", () => {
            // mocks an error object without message
            let errorObjectWithoutMessage = {
                otherAttribute: randomString.generate()
            };

            // expected function error response
            let expectedFunctionErrorResponse = {
                status: 400,
                success: false,
                reason: JSON.stringify(errorObjectWithoutMessage)
            };

            expect(AWSLambdaUtilities.retrieveLambdaErrorResponse(errorObjectWithoutMessage)).toEqual(expectedFunctionErrorResponse);
        })

        it("string error in request | must return an object with error data, including the string error", () => {
            // mocks a string error
            let errorString = randomString.generate();

            // expected function error response
            let expectedFunctionErrorResponse = {
                status: 400,
                success: false,
                reason: errorString
            };

            expect(AWSLambdaUtilities.retrieveLambdaErrorResponse(errorString)).toEqual(expectedFunctionErrorResponse);
        })
    })

    describe("callLambdaSyncFunction function tests | calls a lambda function synchronously", () => {
        it("function called with success: must return the response's payload", () => {
            let expectedAWSLambdaResponseArray = [];
            let randomFunctionName = randomString.generate();

            // mocks a valid function request
            let validFunctionRequest = {
                randomKey: randomString.generate(),
                randomKey1: randomString.generate
            };

            // mocks a valid randomFunctionName Lambda response
            let validResponse = {
                Payload: {
                    success: true
                }
            };
            TestUtilities.fillMockAWSLambdaExpectedResponseArray(expectedAWSLambdaResponseArray, randomFunctionName, validResponse);

            // mocks the AWS Lambda client
            let awsLambdaClient = TestUtilities.mockAWSLambdaSyncResponse(AWS, expectedAWSLambdaResponseArray);
            // saves mocked AWS Lambda client to the singleton
            AWSLambdaConfig.getInstance().setAWSLambdaClient(awsLambdaClient);

            let result = AWSLambdaUtilities.callLambdaSyncFunction(randomFunctionName, validFunctionRequest);
            expect(result).toEqual(validResponse.Payload);
        })

        it("invalid lambda response: must throw the error", () => {
            let expectedAWSLambdaResponseArray = [];
            let randomFunctionName = randomString.generate();

            // mocks a valid function request
            let validFunctionRequest = {
                randomKey: randomString.generate(),
                randomKey1: randomString.generate()
            };

            // mocks a invalid randomFunctionName Lambda response
            let invalidResponse = {
                Payload: {
                    success: false
                }
            };
            TestUtilities.fillMockAWSLambdaExpectedResponseArray(expectedAWSLambdaResponseArray, randomFunctionName, invalidResponse);

            // mocks the AWS Lambda client
            let awsLambdaClient = TestUtilities.mockAWSLambdaSyncResponse(AWS, expectedAWSLambdaResponseArray);
            // saves mocked AWS Lambda client to the singleton
            AWSLambdaConfig.getInstance().setAWSLambdaClient(awsLambdaClient);

            expect(() => AWSLambdaUtilities.callLambdaSyncFunction(randomFunctionName, validFunctionRequest)).toThrow();

            // mocks a invalid randomFunctionName Lambda response
            invalidResponse = {
                randomKey: randomString.generate()
            };
            TestUtilities.fillMockAWSLambdaExpectedResponseArray(expectedAWSLambdaResponseArray, randomFunctionName, invalidResponse);

            // mocks the AWS Lambda client
            awsLambdaClient = TestUtilities.mockAWSLambdaSyncResponse(AWS, expectedAWSLambdaResponseArray);
            // saves mocked AWS Lambda client to the singleton
            AWSLambdaConfig.getInstance().setAWSLambdaClient(awsLambdaClient);

            expect(() => AWSLambdaUtilities.callLambdaSyncFunction(randomFunctionName, validFunctionRequest)).toThrow();
        })

        it("function called with error: must throw the error", () => {
            let randomFunctionName = randomString.generate();

            // mocks a valid function request
            let validFunctionRequest = {
                randomKey: randomString.generate(),
                randomKey1: randomString.generate
            };

            // mocks the AWS Lambda client
            let awsLambdaClient = TestUtilities.mockAWSLambdaSyncError(AWS);
            // saves mocked AWS Lambda client to the singleton
            AWSLambdaConfig.getInstance().setAWSLambdaClient(awsLambdaClient);

            expect(() => AWSLambdaUtilities.callLambdaSyncFunction(randomFunctionName, validFunctionRequest)).toThrow();
        })
    })
})