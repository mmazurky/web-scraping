package com.test.scrap.utils;

import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.config.Registry;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.SSLContextBuilder;
import org.apache.http.conn.ssl.TrustSelfSignedStrategy;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.util.EntityUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONObject;

import java.nio.charset.Charset;
import java.util.Map;


public class HttpRequest {

    private static final Logger log = LogManager.getLogger();
    private JSONObject requestJSON = new JSONObject();
    private CloseableHttpResponse response = null;
    private CloseableHttpClient client = null;

    private HttpRequestBase fillHttpJsonRequest(String url, Map<String, String> headerMap, RequestConstants.METHOD method) {
        try {
            boolean isPostMethod = method.equals(RequestConstants.METHOD.POST);

            HttpRequestBase httpRequestBase = isPostMethod ? new HttpPost(url) : new HttpGet(url);
            httpRequestBase.setHeader("Content-Type", "application/json");
            if (headerMap != null) {
                headerMap.entrySet().forEach((entry) -> {
                    httpRequestBase.setHeader(entry.getKey(), entry.getValue());
                });
            }

            if (isPostMethod) {
                StringEntity se = new StringEntity(requestJSON.toString(), Charset.forName("UTF-8"));
                se.setContentEncoding("UTF-8");
                se.setContentType("application/json");
                ((HttpPost) httpRequestBase).setEntity(se);
            }

            return httpRequestBase;
        } catch (Exception e) {
            log.info("An exception occurred", e);
            return null;
        }
    }

    public boolean sendRequest(String url, Map<String, String> headerMap, RequestConstants.METHOD method) {
        try {
            HttpRequestBase httpRequestBase = fillHttpJsonRequest(url, headerMap, method);

            SSLContextBuilder builder = new SSLContextBuilder();
            builder.loadTrustMaterial(null, new TrustSelfSignedStrategy());
            SSLConnectionSocketFactory sslConnectionSocketFactory = new SSLConnectionSocketFactory(builder.build(), NoopHostnameVerifier.INSTANCE);
            Registry<ConnectionSocketFactory> registry = RegistryBuilder.<ConnectionSocketFactory>create()
                    .register("http", new PlainConnectionSocketFactory())
                    .register("https", sslConnectionSocketFactory)
                    .build();

            PoolingHttpClientConnectionManager cm = new PoolingHttpClientConnectionManager(registry);
            cm.setMaxTotal(100);
            client = HttpClients.custom()
                    .setSSLSocketFactory(sslConnectionSocketFactory)
                    .setConnectionManager(cm)
                    .build();

            if (response != null) {
                response.close();
            }
            response = client.execute(httpRequestBase);

            log.info("Request: " + httpRequestBase.getRequestLine().getUri() + " -> " + requestJSON + " | Response: " + (response.getStatusLine() != null && response.getStatusLine().getStatusCode() == 200 ? "200" : response.getStatusLine() != null ? response.getStatusLine() : null));
        } catch (Exception e) {
            log.info("An exception occurred", e);
        } finally {
            if (client != null) {
                try {
                    client.close();
                } catch (Exception e) {
                    log.info("An exception occurred");
                }
            }

            if (response != null) {
                try {
                    response.close();
                } catch (Exception e) {
                    log.info("An exception occurred");
                }
            }
        }

        return requestSentWithSuccess(response);
    }

    public String sendRequestWithResponse(String url, Map<String, String> headerMap, RequestConstants.METHOD method) {
        String responseString = "";
        try {
            HttpRequestBase httpRequestBase = fillHttpJsonRequest(url, headerMap, method);

            SSLContextBuilder builder = new SSLContextBuilder();
            builder.loadTrustMaterial(null, new TrustSelfSignedStrategy());
            SSLConnectionSocketFactory sslConnectionSocketFactory = new SSLConnectionSocketFactory(builder.build(), NoopHostnameVerifier.INSTANCE);
            Registry<ConnectionSocketFactory> registry = RegistryBuilder.<ConnectionSocketFactory>create()
                    .register("http", new PlainConnectionSocketFactory())
                    .register("https", sslConnectionSocketFactory)
                    .build();

            PoolingHttpClientConnectionManager cm = new PoolingHttpClientConnectionManager(registry);
            cm.setMaxTotal(100);
            client = HttpClients.custom()
                    .setSSLSocketFactory(sslConnectionSocketFactory)
                    .setConnectionManager(cm)
                    .build();

            if (response != null) {
                response.close();
            }
            response = client.execute(httpRequestBase);
            String responseStatusCode = response.getStatusLine() != null ? String.valueOf(response.getStatusLine().getStatusCode()) : "";

            if (response.getEntity() != null) {
                responseString = EntityUtils.toString(response.getEntity(), "UTF-8");
            }

            log.info("Request: " + httpRequestBase.getRequestLine().getUri() + " -> " + requestJSON + " | Response: " + responseStatusCode + " " + responseString);
        } catch (Exception e) {
            log.info("An exception occurred", e);
        } finally {
            if (client != null) {
                try {
                    client.close();
                } catch (Exception e) {
                    log.info("An exception occurred");
                }
            }

            if (response != null) {
                try {
                    response.close();
                } catch (Exception e) {
                    log.info("An exception occurred");
                }
            }
        }

        return responseString;
    }

    private boolean requestSentWithSuccess(CloseableHttpResponse response) {
        return response.getStatusLine() != null && response.getStatusLine().getStatusCode() == 200;
    }

    public JSONObject getRequestJSON() {
        return requestJSON;
    }

    public void clearRequestJSON() {
        requestJSON = new JSONObject();
    }

}