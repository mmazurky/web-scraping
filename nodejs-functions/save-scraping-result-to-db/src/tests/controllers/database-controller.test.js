import mockDBLib from 'mock-knex';
import { DatabaseConfig } from "../../configs/database-config.js";
import { TestUtilities } from "../../utils/test-utilities.js";
import randomString from 'randomstring';
import * as TestConstants from '../../constants/test-constants.js';
import { DatabaseController } from "../../controllers/database-controller.js";

describe("DatabaseController tests", () => {
    let databaseController;
    let dbClient;

    beforeEach(() => {
        // mocked db client
        dbClient = TestUtilities.retrieveMockedDBClient(mockDBLib);
        // saves mocked db client to the singleton
        DatabaseConfig.getInstance().setDBClient(dbClient);
        // instantiates the controller
        databaseController = new DatabaseController();
    })

    afterEach(() => {
        // unmock the db client
        TestUtilities.unmockDBClient(mockDBLib, dbClient);
    })

    describe("saveScrapingResultToDB function tests | saves a scraping result to DB", () => {
        it("data inserted with success in the DB: must resolve and return true", async () => {
            // random scraping result
            let scrapingResult = randomString.generate();

            // mocks success when the DB client tries to insert in the DB
            TestUtilities.mockResolvedDBOperation(mockDBLib, TestConstants.DATABASE_MOCKED_SUCCESS_MESSAGE);

            return databaseController.saveScrapingResultToDB(scrapingResult).then(result => {
                expect(result).toBe(true);
            })
        })

        it("error inserting data in the DB: must reject and return an error", async () => {
            // random scraping result
            let scrapingResult = randomString.generate();

            // mocks error when the DB client tries to insert in the DB
            TestUtilities.mockRejectedDBOperation(mockDBLib, TestConstants.DATABASE_MOCKED_ERROR_MESSAGE);

            return databaseController.saveScrapingResultToDB(scrapingResult).catch(e => {
                expect(e).toBeInstanceOf(Error);
            })
        })

        it("error in DB client: must reject and return an error", async () => {
            // random scraping result
            let scrapingResult = randomString.generate();

            // saves invalid db client to the singleton
            DatabaseConfig.getInstance().setDBClient(null);
            // instantiates the controller
            databaseController = new DatabaseController();

            return databaseController.saveScrapingResultToDB(scrapingResult).catch(e => {
                expect(e).toBeInstanceOf(Error);
            })
        })
    })
})