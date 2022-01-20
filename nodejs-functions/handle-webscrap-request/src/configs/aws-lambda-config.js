import AWS from 'aws-sdk';

class AWSLambdaConfigSingleton {
    constructor() {
        this.lambda = new AWS.Lambda();
    }

    /**
     * Retrieves the AWS Lambda client
     * @returns 
     */
    getAWSLambdaClient() {
        return this.lambda;
    }

    /**
     * Sets the AWS Lambda client
     * @param {Lambda} awsLambdaClient 
     */
    setAWSLambdaClient(awsLambdaClient) {
        this.lambda = awsLambdaClient;
    }
}


class AWSLambdaConfig {
    constructor() {
        throw new Error('Use AWSLambdaConfig.getInstance()');
    }

    static getInstance() {
        if (!AWSLambdaConfig.instance) {
            AWSLambdaConfig.instance = new AWSLambdaConfigSingleton();
        }
        return AWSLambdaConfig.instance;
    }

}

export {
    AWSLambdaConfig
}