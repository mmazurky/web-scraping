import { DatabaseConfig } from "../../configs/database-config.js";
import { getEnvProperty, setEnvProperty } from "../../utils/properties-utilities.js";
import * as EnvConstants from "../../constants/env-constants.js";
import randomstring from "randomstring";

let initialDBHost;

beforeAll(() => {
    initialDBHost = getEnvProperty(EnvConstants.DB_HOST);
})

afterEach(async () => {
    await setEnvProperty(EnvConstants.DB_HOST, initialDBHost);
})

describe("DatabaseConfig tests", () => {
    describe("constructor function tests | class cannot be instantiated", () => {
        it("attempt to instantiate the class: must not instantiate and return an error", () => {
            expect(() => new DatabaseConfig()).toThrowError();
        })
    })

    describe("manageDBConfigUpdate function tests | manages any config update to the db", () => {
        it("updated db config in environment: must update the db client", async () => {
            // retrieves the old config
            let oldConfig = DatabaseConfig.getInstance().retrieveDBConfig();

            // updates any DB config
            await setEnvProperty(EnvConstants.DB_HOST, randomstring.generate());

            // executes the function to manage the db config's update
            DatabaseConfig.getInstance().manageDBConfigUpdate();
            let newConfig = DatabaseConfig.getInstance().retrieveDBConfig();

            // retrieves the new config
            expect(oldConfig).not.toEqual(newConfig);
        })
    })
})