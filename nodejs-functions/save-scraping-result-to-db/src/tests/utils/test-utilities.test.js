import knex from 'knex';
import mockKnexLib from 'mock-knex';

describe("test-utilities tests", () => {
    describe("unmockDBClient function tests", () => {
        it("invalid function request: must throw an error", () => {
            // generates a valid db lib for the request
            let validMockDBLib = mockKnexLib;
            // generates an invalid db lib for the request
            let invalidMockDBLib = null;

            // generates a valid db client for the request
            let validDBClient = knex({
                client: 'mysql2',
            });
            // generates an invalid db client for the request
            let invalidDBClient = null;

            expect(() => unmockDBClient(validMockDBLib, invalidDBClient)).toThrowError();
            expect(() => unmockDBClient(invalidMockDBLib, validDBClient)).toThrowError();
            expect(() => unmockDBClient(invalidMockDBLib, invalidDBClient)).toThrowError();
        })
    })
})