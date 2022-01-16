import { formatURLPath } from "../../utils/webscraper-utilities.js";

describe("webscraper-utilities tests", () => {
    describe("formatURLPath function tests | returns a formatted URL including the path", () => {
        it("valid url with final slash in request | must return the same url", () => {
            let validUrl = "https://www.google.com/";
            let expectedUrl = "https://www.google.com/";

            let result = formatURLPath(validUrl);
            expect(result).toEqual(expectedUrl);
        })

        it("valid url without final slash in request | must return the url including a final slash", () => {
            let validUrl = "https://www.google.com";
            let expectedUrl = "https://www.google.com/";

            let result = formatURLPath(validUrl)
            expect(result).toEqual(expectedUrl);
        })

        it("valid url with path and final slash in request | must return the same url", () => {
            let validUrl = "https://www.google.com/path/";
            let expectedUrl = "https://www.google.com/path/";

            let result = formatURLPath(validUrl)
            expect(result).toEqual(expectedUrl);
        })

        it("valid url with path and without final slash in request | must return the url including a final slash", () => {
            let validUrl = "https://www.google.com/path";
            let expectedUrl = "https://www.google.com/path/";

            let result = formatURLPath(validUrl)
            expect(result).toEqual(expectedUrl);
        })

        it("invalid url in request | must throw a error", () => {
            let invalidUrl = "https//www.google.com";

            expect(() => formatURLPath(invalidUrl)).toThrowError();
        })
    })
})