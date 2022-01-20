import AWSMock from 'aws-sdk-mock';
import randomstring from "randomstring";
import * as TestConstants from "../constants/test-constants.js";
import * as WebscraperConstants from '../constants/webscraper-constants.js';

class TestUtilities {
    /**
     * Retrieves a path to create a sitemap with token
     * @returns 
     */
    static retrieveCreateSitemapWithTokenPath() {
        return WebscraperConstants.CREATE_SITEMAP_PATH + "?api_token=" + TestConstants.RANDOM_WEBSCRAPER_TOKEN;
    }

    /**
     * Retrieves a path to create a scraping job with token
     * @returns 
     */
    static retrieveCreateScrapingJobWithTokenPath() {
        return WebscraperConstants.CREATE_SCRAPING_JOB_PATH + "?api_token=" + TestConstants.RANDOM_WEBSCRAPER_TOKEN;
    }

    /**
     * Mocks robots.txt content with sitemaps
     * @param {string} url 
     * @returns 
     */
    static mockRobotsTxtWithSitemaps(url) {
        let expectedSitemapArray = [url + "sitemap.xml", url + "sitemap_index.xml"];

        let robotsTxtFileContent = "User-agent: *" + "\n" + "Disallow: /config/" + "\n";
        expectedSitemapArray.forEach(sitemap => {
            robotsTxtFileContent += "Sitemap: " + sitemap + "\n";
        });

        return robotsTxtFileContent;
    }

    /**
     * Mocks Http Response of robots.txt with sitemaps
     * @param {nock} nock 
     * @param {string} url 
     */
    static mockRobotsWithSitemapsHttpResponse(nock, url) {
        let urlAux = new URL(url);
        nock(urlAux.protocol + "//" + urlAux.host)
            .persist()
            .head("/robots.txt")
            .reply(200, {});

        nock(urlAux.protocol + "//" + urlAux.host)
            .persist()
            .get("/robots.txt")
            .reply(200, TestUtilities.mockRobotsTxtWithSitemaps(url));
    }

    /**
     * Mocks Http Response of POST with success
     * @param {nock} nock 
     * @param {string} host 
     * @param {string} path 
     * @param {*} responseBody 
     */
    static mockHttpPostSuccessResponse(nock, host, path, responseBody) {
        nock(host)
            .persist()
            .post(path)
            .reply(200, responseBody);
    }

    /**
     * Mocks Http Response of POST with error
     * @param {nock} nock 
     * @param {string} host 
     * @param {string} path 
     * @param {*} responseBody 
     */
    static mockHttpPostErrorResponse(nock, host, path, responseBody) {
        nock(host)
            .persist()
            .post(path)
            .reply(400, responseBody);
    }


    static fillMockAWSLambdaExpectedResponseArray(expectedResponseArray, functionName, response) {
        expectedResponseArray[functionName] = response;
    }

    static mockAWSLambdaSyncResponse(awsInstance, expectedResponseArray) {
        AWSMock.restore('Lambda', 'invoke');
        AWSMock.setSDKInstance(awsInstance);
        AWSMock.mock('Lambda', 'invoke', function (params, callback) {
            let functionName = params.FunctionName;
            let expectedFunctionResponse = expectedResponseArray[functionName];

            callback(null, expectedFunctionResponse);
        })
        return new awsInstance.Lambda({
            region: TestConstants.AWS_LAMBDA_REGION
        });
    }

    static mockAWSLambdaSyncError(awsInstance) {
        AWSMock.restore('Lambda', 'invoke');
        AWSMock.setSDKInstance(awsInstance);
        AWSMock.mock('Lambda', 'invoke', function (params, callback) {
            callback(new Error(randomstring.generate()), {});
        })
        return new awsInstance.Lambda({
            region: TestConstants.AWS_LAMBDA_REGION
        });
    }
}

export {
    TestUtilities
}