import { DatabaseController } from './database-controller.js';
import { retrieveLambdaSuccessResponse, retrieveLambdaErrorResponse } from "../utils/aws-lambda-utilities.js";

class AwsLambdaController {
    /**
     * Handler method used by AWS Lambda
     * @param {object} event 
     * @param {*} context 
     */
    async handler(event, context) {
        //instantiates the controller
        let databaseController = new DatabaseController();

        // saves the result to the DB
        let saveScrapingResult = await databaseController.saveScrapingResultToDB(event).then(() => {
            // returns the request response
            return retrieveLambdaSuccessResponse();
        }).catch(error => {
            // returns the request response
            return retrieveLambdaErrorResponse(error);
        });

        return saveScrapingResult;
    };
}

export {
    AwsLambdaController
};