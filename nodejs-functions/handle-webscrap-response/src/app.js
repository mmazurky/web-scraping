import { AwsLambdaController } from './controllers/aws-lambda-controller.js';
import { WebscraperController } from './controllers/webscraper-controller.js';

function awsLambdaHandler(event, context) {
    return new AwsLambdaController().handler(event, context);
}
function handleWebscrapResponse(event) {
    return new WebscraperController().handleWebscrapResponse(event);
}

export {
    awsLambdaHandler,
    handleWebscrapResponse
}