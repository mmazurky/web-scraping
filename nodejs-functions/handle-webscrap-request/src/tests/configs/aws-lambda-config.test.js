import { AWSLambdaConfig } from "../../configs/aws-lambda-config.js";

describe("AWSLambdaConfig tests", () => {
    describe("constructor function tests | class cannot be instantiated", () => {
        it("attempt to instantiate the class: must not instantiate and return an error", () => {
            expect(() => new AWSLambdaConfig()).toThrowError();
        })
    })
})