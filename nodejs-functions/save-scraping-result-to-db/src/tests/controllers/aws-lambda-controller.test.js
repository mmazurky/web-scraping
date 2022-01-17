import { AwsLambdaController } from "../../controllers/aws-lambda-controller.js";
import { retrieveLambdaSuccessResponse } from "../../utils/aws-lambda-utilities.js";
import { TestUtilities } from "../../utils/test-utilities.js";
import * as TestConstants from "../../constants/test-constants.js";
import mockDBLib from 'mock-knex';
import { DatabaseConfig } from "../../configs/database-config.js";
import randomString from 'randomstring';

describe("AwsLambdaController tests", () => {
    let awsLambdaController;
    let dbClient;

    beforeEach(() => {
        // mocked db client
        dbClient = TestUtilities.retrieveMockedDBClient(mockDBLib);
        // instantiates the controller
        awsLambdaController = new AwsLambdaController();
        // saves mocked db client to the singleton
        DatabaseConfig.getInstance().setDBClient(dbClient);
    })

    afterEach(() => {
        // unmock the db client
        TestUtilities.unmockDBClient(mockDBLib, dbClient);
    })

    describe("handler function tests | handles the save scraping result to DB via AWS Lambda", () => {
        it("success saving scraping result to DB: must resolve and return the response", async () => {
            // mocks a valid function request
            let validFunctionRequest = randomString.generate();

            // mocks success when the DB client tries to insert in the DB
            TestUtilities.mockResolvedDBOperation(mockDBLib, TestConstants.DATABASE_MOCKED_SUCCESS_MESSAGE);

            // sends the request
            await awsLambdaController.handler(validFunctionRequest, null).then(result => {
                let expectedSuccessResponse = retrieveLambdaSuccessResponse();
                expect(result).toEqual(expectedSuccessResponse);
            });
        })

        it("database error saving scraping result: must reject and return the error data in response", async () => {
            // mocks a valid function request
            let validFunctionRequest = randomString.generate();

            // mocks error when the DB client tries to insert in the DB
            TestUtilities.mockRejectedDBOperation(mockDBLib, TestConstants.DATABASE_MOCKED_ERROR_MESSAGE);

            // sends the request
            await awsLambdaController.handler(validFunctionRequest, null).then(result => {
                let expectedErrorResponse = TestConstants.DATABASE_MOCKED_ERROR_MESSAGE;
                expect(result.reason).toContain(expectedErrorResponse);
            });
        })

    })
})