import randomstring from "randomstring";
import { getEnvProperty } from "../../utils/properties-utilities.js";
import * as EnvConstants from "../../constants/env-constants.js";

describe("properties-utilities tests", () => {
    describe("getEnvProperty function tests | returns a environment variable", () => {
        it("environment variable exists in .env file: return its value", () => {
            // gets an existent variable from .env
            let validVariable = EnvConstants.DB_CLIENT;

            // gets the environment's property
            let result = getEnvProperty(validVariable);
            expect(result).not.toBe("");
        })

        it("environment variable exists in system: return its value", () => {
            // gets an existent variable from environment
            let validVariable = "NODE_ENV";

            // gets the environment's property
            let result = getEnvProperty(validVariable);
            expect(result).not.toBe("");
        })
        it("environment variable doesn't exist: returns an empty string", () => {
            // generates an invalid variable
            let invalidVariable = randomstring.generate();

            // gets the environment's property
            let result = getEnvProperty(invalidVariable);
            expect(result).toBe("");
        })
    })
})