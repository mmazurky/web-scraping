import { retrieveLambdaErrorResponse } from "../../utils/aws-lambda-utilities.js";
import randomString from 'randomstring';

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

            expect(retrieveLambdaErrorResponse(errorObjectWithMessage)).toEqual(expectedFunctionErrorResponse);
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

            expect(retrieveLambdaErrorResponse(errorObjectWithoutMessage)).toEqual(expectedFunctionErrorResponse);
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

            expect(retrieveLambdaErrorResponse(errorString)).toEqual(expectedFunctionErrorResponse);
        })
    })
})