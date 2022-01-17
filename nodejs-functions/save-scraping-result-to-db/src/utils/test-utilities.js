import knex from 'knex';

class TestUtilities {
    /**
     * Retrieves a mocked DB Client
     * @param {mock-knex} mockDBLib 
     * @returns 
     */
    static retrieveMockedDBClient(mockDBLib) {
        let db = knex({
            client: 'mysql2',
        });

        return mockDBLib.mock(db);
    }

    /**
     * Unmocks a DB Client
     * @param {mock-knex} mockDBLib 
     * @param {knex} dbClient 
     */
    static unmockDBClient(mockDBLib, dbClient) {
        mockDBLib.getTracker().uninstall();
        mockDBLib.unmock(dbClient);
    }

    /**
     * Mocks a DB operation executed with success
     * @param {mock-knex} mockDBLib 
     * @param {string} successMessage 
     */
    static mockResolvedDBOperation(mockDBLib, successMessage) {
        mockDBLib.getTracker().install();
        mockDBLib.getTracker().on("query", function sendResult(query, step) {
            query.response(successMessage);
        });
    }

    /**
     * Mocks an error executing a DB operation
     * @param {mock-knex} mockDBLib 
     * @param {string} errorMessage 
     */
    static mockRejectedDBOperation(mockDBLib, errorMessage) {
        mockDBLib.getTracker().install();
        mockDBLib.getTracker().on("query", function sendResult(query, step) {
            query.reject(errorMessage);
        });
    }
}

export {
    TestUtilities
}