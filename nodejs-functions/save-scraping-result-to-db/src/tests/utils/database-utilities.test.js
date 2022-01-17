import { retrieveScrapingDBTable, retrieveScrapingDBColumn } from "../../utils/database-utilities.js";
import { getEnvProperty, setEnvProperty } from "../../utils/properties-utilities.js";
import * as EnvConstants from "../../constants/env-constants.js";
import * as DatabaseConstants from "../../constants/database-constants.js";
import randomstring from "randomstring";

let initialDBTable;
let initialDBColumn;

describe("database-utilities tests", () => {
    describe("retrieveScrapingDBTable function tests", () => {
        beforeAll(() => {
            // retrieves the DB Table value
            initialDBTable = getEnvProperty(EnvConstants.DB_TABLE);
        })

        afterEach(async () => {
            // saves the DB Table initial value to .env
            await setEnvProperty(EnvConstants.DB_TABLE, initialDBTable);
        })

        it("db table env variable has value: must return its value", async () => {
            // generates a DB Table value
            let dbTablevalue = randomstring.generate();
            // saves the generated value to DB_TABLE variable in .env
            await setEnvProperty(EnvConstants.DB_TABLE, dbTablevalue);

            // gets the DB_TABLE's value in environment
            let result = retrieveScrapingDBTable();
            expect(result).toEqual(dbTablevalue);
        })

        it("db table env variable hasn't value: must return the default value", async () => {
            // empty DB Table value
            let dbTablevalue = "";
            // saves the empty value to DB_TABLE variable in .env
            await setEnvProperty(EnvConstants.DB_TABLE, dbTablevalue);

            // gets the DB_TABLE's value in environment
            let result = retrieveScrapingDBTable();
            expect(result).toEqual(DatabaseConstants.DEFAULT_SCRAPING_TABLE);
        })
    })

    describe("retrieveScrapingDBColumn function tests", () => {
        beforeAll(() => {
            // retrieves the DB Column value
            initialDBColumn = getEnvProperty(EnvConstants.DB_COLUMN);
        })

        afterEach(async () => {
            // saves the DB Column initial value to .env
            await setEnvProperty(EnvConstants.DB_COLUMN, initialDBColumn);
        })

        it("db column env variable has value: must return its value", async () => {
            // generates a DB Column value
            let dbColumnValue = randomstring.generate();
            // saves the generated value to DB_COLUMN variable in .env
            await setEnvProperty(EnvConstants.DB_COLUMN, dbColumnValue);

            // gets the DB_COLUMN's value in environment
            let result = retrieveScrapingDBColumn();
            expect(result).toEqual(dbColumnValue);
        })

        it("db column env variable hasn't value: must return the default value", async () => {
            // empty DB Table value
            let dbColumnValue = "";
            // saves the empty value to DB_TABLE variable in .env
            await setEnvProperty(EnvConstants.DB_COLUMN, dbColumnValue);

            // gets the DB_COLUMN's value in environment
            let result = retrieveScrapingDBColumn();
            expect(result).toEqual(DatabaseConstants.DEFAULT_SCRAPING_COLUMN);
        })
    })
})