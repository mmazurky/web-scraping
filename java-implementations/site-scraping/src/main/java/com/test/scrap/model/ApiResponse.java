package com.test.scrap.model;

import com.google.gson.Gson;

public class ApiResponse {
    private boolean success = false;
    private String reason = "";

    public ApiResponse(boolean success, String reason) {
        this.success = success;
        this.reason = reason;
    }

    public String toJson() {
        return new Gson().toJson(this);
    }
}
