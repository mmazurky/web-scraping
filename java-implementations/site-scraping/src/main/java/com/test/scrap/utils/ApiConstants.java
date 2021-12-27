package com.test.scrap.utils;

public class ApiConstants {
    public static enum METHOD {
        POST, GET
    }

    // response key constants
    public static final String RESPONSE_STATUS_KEY = "status";
    public static final String RESPONSE_BODY_KEY = "body";
    public static final String RESPONSE_REASON_KEY = "reason";
    public static final String RESPONSE_DATA_KEY = "data";
    // response value constants
    public static final Integer RESPONSE_STATUS_SUCCESS_CODE_VALUE = 200;
    public static final Integer RESPONSE_STATUS_ERROR_CODE_VALUE = 500;
}
