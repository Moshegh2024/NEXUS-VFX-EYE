package com.nexus.vfxeye;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.net.Uri;
import androidx.annotation.RequiresApi;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

public final class MainActivity extends Activity {
    private WebView webView;
    private static final class LocalContentWebViewClient extends WebViewClientCompat {
        private final WebViewAssetLoader assetLoader;
        LocalContentWebViewClient(WebViewAssetLoader assetLoader) { this.assetLoader = assetLoader; }
        @Override @RequiresApi(21)
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            return assetLoader.shouldInterceptRequest(request.getUrl());
        }
        @Override @SuppressWarnings("deprecation")
        public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
            return assetLoader.shouldInterceptRequest(Uri.parse(url));
        }
    }
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
            .addPathHandler("/res/", new WebViewAssetLoader.ResourcesPathHandler(this)).build();
        webView.setWebViewClient(new LocalContentWebViewClient(assetLoader));
        webView.loadUrl("https://appassets.androidplatform.net/assets/public/index.html");
        setContentView(webView);
    }
    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        if (webView != null) { webView.stopLoading(); webView.destroy(); webView = null; }
        super.onDestroy();
    }
}