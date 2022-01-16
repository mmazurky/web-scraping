import nock from 'nock';
import randomString from 'randomstring';
import { WebscraperController } from "../../controllers/webscraper-controller.js";
import { TestUtilities } from "../../utils/test-utilities.js";
import { retrieveDefaultSitemapFiles } from '../../utils/webscraper-utilities.js'
import * as TestConstants from "../../utils/test-constants.js";
import * as WebscraperConstants from '../../utils/webscraper-constants.js';

describe("WebscraperController tests", () => {
    let webscraperController;

    beforeEach(() => {
        //instantiates the controller
        webscraperController = new WebscraperController();
    })

    afterEach(() => {
        // clears nock to mock http requests
        nock.cleanAll();
    })

    describe("createSitemap function tests | creates a sitemap in webscraper", () => {
        it("valid response creating a sitemap: must resolve and return the sitemap id", () => {
            // generates a random sitemap id
            let resultSitemapId = Math.random();

            // mocks a http response from robots.txt with sitemaps
            TestUtilities.mockRobotsWithSitemapsHttpResponse(nock, TestConstants.VALID_URL);

            // mocks a expected http success response
            let httpSuccessResponse = {
                success: true,
                data: {
                    id: resultSitemapId
                }
            };

            // mocks the http response when the API is called
            TestUtilities.mockHttpPostSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, TestUtilities.retrieveCreateSitemapWithTokenPath(), httpSuccessResponse);

            // sends the request
            return webscraperController.createSitemap(TestConstants.VALID_URL, TestConstants.VALID_ELEMENT_SELECTOR, TestConstants.RANDOM_WEBSCRAPER_TOKEN).then(result => {
                expect(result).toBe(resultSitemapId);
            });
        });

        it("valid API status, but no sitemap id returned: must reject and return the response", () => {
            // mocks a http response from robots.txt with sitemaps
            TestUtilities.mockRobotsWithSitemapsHttpResponse(nock, TestConstants.VALID_URL);

            // mocks a expected http success response
            let httpSuccessResponseWithoutId = {
                success: true,
                data: {
                    randomKey: randomString.generate()
                }
            };

            // mocks the http response when the API is called
            TestUtilities.mockHttpPostSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, TestUtilities.retrieveCreateSitemapWithTokenPath(), httpSuccessResponseWithoutId);

            // sends the request
            return webscraperController.createSitemap(TestConstants.VALID_URL, TestConstants.VALID_ELEMENT_SELECTOR, TestConstants.RANDOM_WEBSCRAPER_TOKEN).catch(error => {
                expect(error).toEqual(httpSuccessResponseWithoutId);
            });
        });

        it("invalid API status creating a sitemap: must reject and return the response", () => {
            // mocks a http response from robots.txt with sitemaps
            TestUtilities.mockRobotsWithSitemapsHttpResponse(nock, TestConstants.VALID_URL);

            // mocks a expected http error response
            let httpErrorResponse = {
                success: false
            };

            // mocks the http response when the API is called
            TestUtilities.mockHttpPostSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, TestUtilities.retrieveCreateSitemapWithTokenPath(), httpErrorResponse);

            // sends the request
            return webscraperController.createSitemap(TestConstants.VALID_URL, TestConstants.VALID_ELEMENT_SELECTOR, TestConstants.RANDOM_WEBSCRAPER_TOKEN).catch(error => {
                expect(error).toEqual(httpErrorResponse);
            });
        });

        it("mandatory fields not filled: must reject and return the error", () => {
            // expected error message
            let errorMessageResponse = WebscraperConstants.INVALID_CREATE_SITEMAP_REQUEST_MESSAGE;

            // sends the request
            return webscraperController.createSitemap(null, null, null).catch(error => {
                expect(error.message).toBe(errorMessageResponse);
            })
        })
    })

    describe("getSitemaps function tests | searchs for sitemaps in robots.txt or default sitemap paths in the url", () => {
        it("sitemaps available in robots.txt file: must resolve and return an array with the sitemaps", async () => {
            // mocks a http response from robots.txt with sitemaps
            TestUtilities.mockRobotsWithSitemapsHttpResponse(nock, TestConstants.VALID_URL);

            // sitemap files indicated in the mocked robots.txt
            let expectedSitemapArray = [TestConstants.VALID_URL + "sitemap.xml", TestConstants.VALID_URL + "sitemap_index.xml"];

            // sends the request
            return webscraperController.getSitemaps(TestConstants.VALID_URL).then(result => {
                expect(result.sort()).toEqual(expectedSitemapArray.sort());
            })
        })

        it("sitemaps not available in robots.txt, but available in default paths: must resolve and return an array with the sitemaps", async () => {
            // mocks a http response from robots.txt without sitemaps
            TestUtilities.mockRobotsWithoutSitemapsHttpResponse(nock, TestConstants.VALID_URL);

            // sitemap files expected to be available in the default paths
            let expectedDefaultSitemapArray = [TestConstants.VALID_URL + "sitemap.xml", TestConstants.VALID_URL + "sitemap_index.xml"];

            // iterate over the default sitemap files
            retrieveDefaultSitemapFiles().forEach(defaultSitemapFile => {
                // mounts the default sitemap path
                let sitemapPath = TestConstants.VALID_URL + defaultSitemapFile;

                // if the sitemap is expected to be available in the default path
                let sitemapExpectedToBeAvailable = expectedDefaultSitemapArray.includes(sitemapPath);
                if (sitemapExpectedToBeAvailable) {
                    // mocks a http response to indicate that the path exists
                    TestUtilities.mockHttpPathExistsResponse(nock, sitemapPath);
                } else {
                    // mocks a http response to indicate that the path don't exist
                    TestUtilities.mockHttpPathNotExistsResponse(nock, sitemapPath);
                }
            });

            // sends the request
            return webscraperController.getSitemaps(TestConstants.VALID_URL).then(result => {
                expect(result.sort()).toEqual(expectedDefaultSitemapArray.sort());
            })
        })

        it("sitemaps not available in robots.txt and default paths: must resolve and return an empty array", async () => {
            // mocks a http response from robots.txt without sitemaps
            TestUtilities.mockRobotsWithoutSitemapsHttpResponse(nock, TestConstants.VALID_URL);

            // iterate over the default sitemap files
            retrieveDefaultSitemapFiles().forEach(defaultSitemapFile => {
                // mounts the default sitemap path
                let sitemapPath = TestConstants.VALID_URL + defaultSitemapFile;
                // mocks a http response to indicate that the path don't exist
                TestUtilities.mockHttpPathNotExistsResponse(nock, sitemapPath);
            });

            // sends the request
            return webscraperController.getSitemaps(TestConstants.VALID_URL).then(result => {
                expect(result).toEqual([]);
            })
        })

        it("invalid url: must resolve and return an empty array", async () => {
            let invalidUrl = TestConstants.INVALID_URL;

            // sends the request
            return webscraperController.getSitemaps(invalidUrl).then(result => {
                expect(result).toEqual([]);
            })
        })
    })

    describe("sendCreateSitemapRequest function tests | sends a sitemap request to webscraper", () => {
        it("sitemap created with success | must resolve and return the id", () => {
            // sitemap files
            let sitemapArray = [TestConstants.VALID_URL + "sitemap.xml", TestConstants.VALID_URL + "sitemap_index.xml"];

            // generates a random sitemap id
            let resultSitemapId = Math.random();

            // mocks a expected http success response
            let httpSuccessResponse = {
                success: true,
                data: {
                    id: resultSitemapId
                }
            };

            // mocks the http response when the API is called
            TestUtilities.mockHttpPostSuccessResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, TestUtilities.retrieveCreateSitemapWithTokenPath(), httpSuccessResponse);

            // sends the request
            return webscraperController.sendCreateSitemapRequest(TestConstants.VALID_URL, sitemapArray, TestConstants.VALID_ELEMENT_SELECTOR, TestConstants.RANDOM_WEBSCRAPER_TOKEN).then(result => {
                expect(result).toBe(resultSitemapId);
            });
        })

        it("invalid API status creating a sitemap: must reject and return the response", () => {
            // sitemap files
            let sitemapArray = [TestConstants.VALID_URL + "sitemap.xml", TestConstants.VALID_URL + "sitemap_index.xml"];

            // mocks a expected http error response
            let httpErrorResponse = {
                success: false
            };

            // mocks the http error response when the API is called
            TestUtilities.mockHttpPostErrorResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, TestUtilities.retrieveCreateSitemapWithTokenPath(), httpErrorResponse);

            //sends the request
            return webscraperController.sendCreateSitemapRequest(TestConstants.VALID_URL, sitemapArray, TestConstants.VALID_ELEMENT_SELECTOR, TestConstants.RANDOM_WEBSCRAPER_TOKEN).catch(error => {
                expect(error).toEqual(httpErrorResponse);
            });
        });

        it("valid API status, but no sitemap id returned: must reject and return the response", () => {
            // sitemap files
            let sitemapArray = [TestConstants.VALID_URL + "sitemap.xml", TestConstants.VALID_URL + "sitemap_index.xml"];

            // mocks a expected success http response without the sitemap id
            let httpSuccessResponseWithoutId = {
                success: true,
                data: {
                    otherValue: randomString.generate()
                }
            };

            // mocks the http response when the API is called
            TestUtilities.mockHttpPostErrorResponse(nock, WebscraperConstants.WEBSCRAPER_HOST, TestUtilities.retrieveCreateSitemapWithTokenPath(), httpSuccessResponseWithoutId);

            //sends the request
            return webscraperController.sendCreateSitemapRequest(TestConstants.VALID_URL, sitemapArray, TestConstants.VALID_ELEMENT_SELECTOR, TestConstants.RANDOM_WEBSCRAPER_TOKEN).catch(error => {
                expect(error).toEqual(httpSuccessResponseWithoutId);
            });
        });

        it("invalid url: must reject and return the error", () => {
            let invalidUrl = TestConstants.INVALID_URL;

            return expect(webscraperController.sendCreateSitemapRequest(invalidUrl, null, null, null)).rejects.toThrow();
        })
    })

    describe("retrieveCreateSitemapRequestBody function tests | retrieves the body to the create sitemap request", () => {
        it("valid sitemap request | must return all the body fields filled", () => {
            // sitemap files
            let sitemapArray = [TestConstants.VALID_URL + "sitemap.xml", TestConstants.VALID_URL + "sitemap_index.xml"];

            // retrieves the body to use to the create sitemap request
            let result = webscraperController.retrieveCreateSitemapRequestBody(TestConstants.VALID_URL, sitemapArray, TestConstants.VALID_ELEMENT_SELECTOR);

            // checks if all the fields in the body are filled
            expect(result._id).not.toEqual("");
            expect(result.startUrl).not.toEqual([]);
            expect(result.selectors).not.toEqual([]);
        })

        it("sitemap array filled | must return the selector sitemap xml link and the custom selector text in the selectors", () => {
            // sitemap files
            let sitemapArray = [TestConstants.VALID_URL + "sitemap.xml", TestConstants.VALID_URL + "sitemap_index.xml"];

            // retrieves the body to use to the create sitemap request
            let result = webscraperController.retrieveCreateSitemapRequestBody(TestConstants.VALID_URL, sitemapArray, TestConstants.VALID_ELEMENT_SELECTOR);

            // checks if all the necessary selectors were added to the body
            expect(result.selectors).toContain(webscraperController.retrieveSelectorSitemapXmlLink(sitemapArray));
            expect(result.selectors).toContain(webscraperController.retrieveCustomSelectorText(TestConstants.VALID_ELEMENT_SELECTOR, sitemapArray));
        })

        it("empty sitemap array | must return the custom selector text in the selectors", () => {
            // sitemap files
            let sitemapArray = [];

            // sends the request
            let result = webscraperController.retrieveCreateSitemapRequestBody(TestConstants.VALID_URL, sitemapArray, TestConstants.VALID_ELEMENT_SELECTOR);

            // checks if all the necessary selectors were added to the body
            expect(result.selectors).toContain(webscraperController.retrieveCustomSelectorText(TestConstants.VALID_ELEMENT_SELECTOR, sitemapArray));
        })

        it("invalid url: must return an error", () => {
            let invalidUrl = TestConstants.INVALID_URL;

            expect(() => webscraperController.retrieveCreateSitemapRequestBody(invalidUrl, null, null)).toThrowError();
        })
    })

    describe("retrieveSitemapsFromRobot functions tests | retrieves the sitemaps located in robots.txt", () => {
        it("Sitemaps found in robots.txt: must resolve and return an array with the located sitemaps in the file", async () => {
            // mocks a http response from robots.txt with sitemaps
            TestUtilities.mockRobotsWithSitemapsHttpResponse(nock, TestConstants.VALID_URL);

            // sitemap files indicated in the mocked robots.txt
            let expectedSitemapArray = [TestConstants.VALID_URL + "sitemap.xml", TestConstants.VALID_URL + "sitemap_index.xml"];

            // sends the request
            return webscraperController.retrieveSitemapsFromRobot(TestConstants.VALID_URL).then(result => {
                expect(result.sort()).toEqual(expectedSitemapArray.sort());
            });
        })

        it("Sitemaps not found in robots.txt: must resolve and return an empty array", async () => {
            // mocks a http response from robots.txt with sitemaps
            TestUtilities.mockRobotsWithoutSitemapsHttpResponse(nock, TestConstants.VALID_URL);

            // sends the request
            return webscraperController.retrieveSitemapsFromRobot(TestConstants.VALID_URL).then(result => {
                expect(result).toEqual([]);
            });
        })

        it("robots.txt file don't exist: must resolve and return an empty array", async () => {
            // mocks a http response to indicate that the robots file don't exist
            TestUtilities.mockHttpRobotsFileNotExists(nock, TestConstants.VALID_URL);

            // sends the request
            return webscraperController.retrieveSitemapsFromRobot(TestConstants.VALID_URL).then(result => {
                expect(result).toEqual([]);
            });
        })

        it("robots.txt exists, but got error retrieving its content: must resolve and return an empty array", async () => {
            // mocks a http response to indicate that the robots file exists
            TestUtilities.mockHttpRobotsFileExists(nock, TestConstants.VALID_URL);

            // mocks a http response to indicate invalid response
            TestUtilities.mockHttpGetErrorResponse(nock, TestConstants.VALID_URL, "/robots.txt", {});

            // sends the request
            return webscraperController.retrieveSitemapsFromRobot(TestConstants.VALID_URL).then(result => {
                expect(result).toEqual([]);
            });
        })

        it("invalid url type filled in the request: must resolve and return an empty array", async () => {
            let invalidUrlType = {
                url: TestConstants.VALID_URL
            };

            // sends the request
            return webscraperController.retrieveSitemapsFromRobot(invalidUrlType).then(result => {
                expect(result.sort()).toEqual([]);
            });
        })
    })

    describe("retrieveCustomSelectorText function tests | retrieves the 'sitemap xml link' selector for webscraper", () => {
        it("sitemap array filled in request: returns the default sitemap xml link selector with its sitemapXmlUrls filled as requested", () => {
            // sitemap files
            let sitemapArray = [TestConstants.VALID_URL + "sitemap.xml", TestConstants.VALID_URL + "sitemap_index.xml"];

            // expected selector to be returned
            let expectedSelector = WebscraperConstants.INITIAL_SELECTOR_SITEMAP_XML_LINK_CONFIG;
            expectedSelector.sitemapXmlUrls = sitemapArray;

            // sends the request
            let result = webscraperController.retrieveSelectorSitemapXmlLink(sitemapArray);

            expect(result).toEqual(expectedSelector);
        })
    })

    describe("retrieveCustomSelectorText function tests | retrieves the 'custom text' selector for webscraper", () => {
        it("selector and sitemap array filled in request: returns the custom selector text with its parentSelectors and selectors filled as requested", () => {
            // sitemap files
            let sitemapArray = [TestConstants.VALID_URL + "sitemap.xml", TestConstants.VALID_URL + "sitemap_index.xml"];

            // expected selector to be returned
            let expectedSelector = WebscraperConstants.INITIAL_CUSTOM_SELECTOR_CONFIG;
            expectedSelector.parentSelectors = [WebscraperConstants.CUSTOM_SELECTOR_SITEMAP_SELECTORS];
            expectedSelector.selector = TestConstants.VALID_ELEMENT_SELECTOR;

            // sends the request
            let result = webscraperController.retrieveCustomSelectorText(TestConstants.VALID_ELEMENT_SELECTOR, sitemapArray);

            expect(result).toEqual(expectedSelector);
        })

        it("selector filled in request: returns the custom selector text with default parentSelectors and selector filled as requested", () => {
            // expected selector to be returned
            let expectedSelector = WebscraperConstants.INITIAL_CUSTOM_SELECTOR_CONFIG;
            expectedSelector.parentSelectors = [WebscraperConstants.CUSTOM_SELECTOR_SINGLE_PAGE_SELECTORS];
            expectedSelector.selector = TestConstants.VALID_ELEMENT_SELECTOR;

            // sends the request
            let result = webscraperController.retrieveCustomSelectorText(TestConstants.VALID_ELEMENT_SELECTOR, null);

            expect(result).toEqual(expectedSelector);
        })

        it("sitemapArray filled in request: returns the custom selector text with its parentSelectors filled as requested and default selector", () => {
            // sitemap files
            let sitemapArray = [TestConstants.VALID_URL + "sitemap.xml", TestConstants.VALID_URL + "sitemap_index.xml"];

            // expected selector to be returned
            let expectedSelector = WebscraperConstants.INITIAL_CUSTOM_SELECTOR_CONFIG;
            expectedSelector.parentSelectors = [WebscraperConstants.CUSTOM_SELECTOR_SITEMAP_SELECTORS];
            expectedSelector.selector = WebscraperConstants.CUSTOM_SELECTOR_DEFAULT_SELECTOR;

            // sends the request
            let result = webscraperController.retrieveCustomSelectorText(null, sitemapArray);

            expect(result).toEqual(expectedSelector);
        })
    })

    describe("retrieveAvailableSitemapsFromDefaultPaths function tests | retrieves the default sitemap files which are available", () => {
        it("sitemaps available in default paths: returns an array with the available default sitemap files", async () => {
            let expectedDefaultSitemapArray = [];

            // iterate over the default sitemap files
            retrieveDefaultSitemapFiles().forEach(defaultSitemapFile => {
                // sitemap path
                let sitemapPath = TestConstants.VALID_URL + defaultSitemapFile;

                // adds the site to the expected default sitemaps
                expectedDefaultSitemapArray.push(sitemapPath);
                // mocks a http response to indicate that the path exists
                TestUtilities.mockHttpPathExistsResponse(nock, sitemapPath);
            });

            // sends the request
            return webscraperController.retrieveAvailableSitemapsFromDefaultPaths(TestConstants.VALID_URL).then(result => {
                expect(result.sort()).toEqual(expectedDefaultSitemapArray.sort());
            });
        })

        it("sitemaps not available in default paths: returns an empty array", async () => {
            // iterate over the default sitemap files
            retrieveDefaultSitemapFiles().forEach(defaultSitemapFile => {
                // sitemap path
                let sitemapPath = TestConstants.VALID_URL + defaultSitemapFile;

                // mocks a http response to indicate that the path don't exist
                TestUtilities.mockHttpPathNotExistsResponse(nock, sitemapPath);
            });

            // sends the request
            return webscraperController.retrieveAvailableSitemapsFromDefaultPaths(TestConstants.VALID_URL).then(result => {
                expect(result).toEqual([]);
            });
        })
    })

    describe("retrieveDefaultSitemapFilesLocation function tests | retrieves the default sitemap files location", () => {
        it("valid url without path: returns an array with the default sitemap files location without the path", () => {
            let validUrlWithoutPath = TestConstants.VALID_URL;
            let expectedDefaultSitemapArray = [];

            // iterate over the default sitemap files
            retrieveDefaultSitemapFiles().forEach(defaultSitemapFile => {
                // sitemap path
                let sitemapPath = TestConstants.VALID_URL + defaultSitemapFile;

                // adds the site to the expected default sitemaps
                expectedDefaultSitemapArray.push(sitemapPath);
            });

            // executes the function
            let result = webscraperController.retrieveDefaultSitemapFilesLocation(validUrlWithoutPath);

            expect(result).toEqual(expectedDefaultSitemapArray);
        })

        it("valid url with path: returns an array with the default sitemap files location following the path", () => {
            let validUrlWithPath = TestConstants.VALID_URL + "somepath/";
            let expectedDefaultSitemapArray = [];

            // iterate over the default sitemap files
            retrieveDefaultSitemapFiles().forEach(defaultSitemapFile => {
                // sitemap path
                let sitemapPath = validUrlWithPath + defaultSitemapFile;

                // adds the site to the expected default sitemaps
                expectedDefaultSitemapArray.push(sitemapPath);
            });

            // executes the function
            let result = webscraperController.retrieveDefaultSitemapFilesLocation(validUrlWithPath);

            expect(result).toEqual(expectedDefaultSitemapArray);
        })

        it("invalid url in request: returns an empty array", () => {
            let invalidUrl = TestConstants.INVALID_URL;

            // executes the function
            let result = webscraperController.retrieveDefaultSitemapFilesLocation(invalidUrl);

            expect(result).toEqual([]);
        })
    })

    describe("validateCreateSitemapRequest function tests | validates the request to create a sitemap", () => {
        it("all mandatory fields not filled: throws an 'invalid create sitemap request' error", () => {
            let expectedError = new Error(WebscraperConstants.INVALID_CREATE_SITEMAP_REQUEST_MESSAGE);

            expect(() => webscraperController.validatesendCreateSitemapRequest(null, null, null)).toThrow(expectedError);
        })

        it("url field not filled: throws an 'invalid create sitemap request' error", () => {
            let expectedError = new Error(WebscraperConstants.INVALID_CREATE_SITEMAP_REQUEST_MESSAGE);

            expect(() => webscraperController.validatesendCreateSitemapRequest(null, TestConstants.VALID_ELEMENT_SELECTOR, TestConstants.RANDOM_WEBSCRAPER_TOKEN)).toThrow(expectedError);
        })

        it("selector field not filled: throws an 'invalid create sitemap request' error", () => {
            let expectedError = new Error(WebscraperConstants.INVALID_CREATE_SITEMAP_REQUEST_MESSAGE);

            expect(() => webscraperController.validatesendCreateSitemapRequest(TestConstants.VALID_URL, null, TestConstants.RANDOM_WEBSCRAPER_TOKEN)).toThrow(expectedError);
        })

        it("webscraperToken field not filled: throws an 'invalid create sitemap request' error", () => {
            let expectedError = new Error(WebscraperConstants.INVALID_CREATE_SITEMAP_REQUEST_MESSAGE);

            expect(() => webscraperController.validatesendCreateSitemapRequest(TestConstants.VALID_URL, TestConstants.VALID_ELEMENT_SELECTOR, null)).toThrow(expectedError);
        })
    })
})