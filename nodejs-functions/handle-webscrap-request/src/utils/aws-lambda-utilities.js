import { AWSLambdaConfig } from "../configs/aws-lambda-config.js";

class AWSLambdaUtilities {
    /**
     * Retrieves Lambda success response
     * @returns 
     */
    static retrieveLambdaSuccessResponse() {
        return {
            status: 200,
            success: true
        };
    }

    /**
     * Retrieves Lambda error response
     * @param {*} error 
     * @returns 
     */
    static retrieveLambdaErrorResponse(error) {
        return {
            status: 400,
            success: false,
            reason: error && error.message ? error.message : typeof error === 'object' ? JSON.stringify(error) : error
        };
    }

    /**
     * Retrieves params to call a sync Lambda function
     * @param {*} request 
     * @returns 
     */
    static retrieveLambdaSyncParams(functionName, request) {
        return {
            FunctionName: functionName,
            InvocationType: 'RequestResponse',
            LogType: 'Tail',
            Payload: JSON.stringify(request)
        };
    }

    /**
     * Calls another AWS Lambda sync function
     * @param {string} functionName 
     * @param {string} payload 
     * @returns 
     */
    static callLambdaSyncFunction(functionName, request) {
        // retrieves the params
        let params = AWSLambdaUtilities.retrieveLambdaSyncParams(functionName, request);

        let result = "";
        //invokes the function
        AWSLambdaConfig.getInstance().getAWSLambdaClient().invoke(params, function (err, data) {
            let functionSuccess = data && data.Payload && data.Payload.success;

            if (err || !functionSuccess) {
                console.log("Error calling the Lambda Function " + functionName + ": ", err ? err : data);
                throw AWSLambdaUtilities.formatAWSLambdaError(functionName, err ? err : data && data.Payload ? data.Payload : data);
            } else {
                result = data.Payload;
            }
        });

        return result;
    };

    /**
     * Format AWS Lambda error
     * @param {string} functionName 
     * @param {*} payload 
     * @returns 
     */
    static formatAWSLambdaError(functionName, payload) {
        let errorInfo = {
            function_name: functionName,
            payload: payload
        }
        return new Error(JSON.stringify(errorInfo));
    }
}

export {
    AWSLambdaUtilities
}