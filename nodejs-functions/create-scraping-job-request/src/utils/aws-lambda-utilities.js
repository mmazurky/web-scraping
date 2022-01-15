class AwsLambdaUtilities {
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
}

export const retrieveLambdaSuccessResponse = AwsLambdaUtilities.retrieveLambdaSuccessResponse;
export const retrieveLambdaErrorResponse = AwsLambdaUtilities.retrieveLambdaErrorResponse;