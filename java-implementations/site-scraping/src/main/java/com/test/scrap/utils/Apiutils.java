package com.test.scrap.utils;

import com.test.scrap.model.ScrapingResponse;
import org.apache.commons.lang3.exception.ExceptionUtils;

public class Apiutils {

    public static String handleApiExceptionResponse(Exception e) {
        return new ScrapingResponse(false, e.getMessage()).toJson();
    }

    public static String handleApiSuccessResponse() {
        return new ScrapingResponse(true, "").toJson();
    }
}
