import { DatabaseController } from './database-controller.js';
import { executeCallback } from "../utils/aws-lambda-utilities.js"

class AwsLambdaController {
    /**
     * Handler method used by AWS Lambda
     * @param {*} event 
     * @param {*} context 
     * @param {*} callback 
     */
    handler(event, context, callback) {
        console.log('Received event:', event);

        try {
            //instantiates the controller
            let databaseController = new DatabaseController();

            // saves the result to the DB
            databaseController.saveScrapingResultToDB(event).then(() => {
                console.log("Finished with success!");
                // returns the request status
                executeCallback(null, callback);
            }).catch(error => {
                console.log("An exception has occurred: " + error);
                // returns the request status
                executeCallback(error, callback);
            });
        } catch (error) {
            console.log("An exception has occurred: " + error);
            // returns the request status
            executeCallback(error, callback);
        }
    };
}

export {
    AwsLambdaController
};