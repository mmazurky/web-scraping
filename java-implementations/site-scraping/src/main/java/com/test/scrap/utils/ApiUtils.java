package com.test.scrap.utils;

import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.google.gson.JsonObject;
import com.test.scrap.model.ScrapingResponse;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;

import java.util.Map;

public class ApiUtils {

    public static String handleApiExceptionResponse(Exception e) {
        return new ScrapingResponse(false, e.getMessage()).toJson();
    }

    public static String handleApiSuccessResponse() {
        return new ScrapingResponse(true, "").toJson();
    }

    public static APIGatewayProxyResponseEvent defineAPIGatewaySuccessResponse(String body) {
        // creates the response object
        APIGatewayProxyResponseEvent apiGatewayProxyResponseEvent = new APIGatewayProxyResponseEvent();
        JsonObject bodyResponse = new JsonObject();
        bodyResponse.addProperty(ApiConstants.RESPONSE_STATUS_KEY, ApiConstants.RESPONSE_STATUS_SUCCESS_CODE_VALUE);
        bodyResponse.addProperty(ApiConstants.RESPONSE_DATA_KEY, body);

        JsonObject rootResponse = new JsonObject();
        rootResponse.add(ApiConstants.RESPONSE_BODY_KEY, bodyResponse);

        // updates the response data
        apiGatewayProxyResponseEvent.setStatusCode(ApiConstants.RESPONSE_STATUS_SUCCESS_CODE_VALUE);
        apiGatewayProxyResponseEvent.setBody(rootResponse.toString());

        return apiGatewayProxyResponseEvent;
    }

    public static APIGatewayProxyResponseEvent defineAPIGatewayErrorResponse(Exception exception) {
        // creates the response object
        APIGatewayProxyResponseEvent apiGatewayProxyResponseEvent = new APIGatewayProxyResponseEvent();
        JsonObject bodyResponse = new JsonObject();
        bodyResponse.addProperty(ApiConstants.RESPONSE_STATUS_KEY, ApiConstants.RESPONSE_STATUS_ERROR_CODE_VALUE);
        bodyResponse.addProperty(ApiConstants.RESPONSE_REASON_KEY, exception.toString());

        JsonObject rootResponse = new JsonObject();
        rootResponse.add(ApiConstants.RESPONSE_BODY_KEY, bodyResponse);

        // updates the response data
        apiGatewayProxyResponseEvent.setStatusCode(ApiConstants.RESPONSE_STATUS_ERROR_CODE_VALUE);
        apiGatewayProxyResponseEvent.setBody(rootResponse.toString());

        return apiGatewayProxyResponseEvent;
    }

}
