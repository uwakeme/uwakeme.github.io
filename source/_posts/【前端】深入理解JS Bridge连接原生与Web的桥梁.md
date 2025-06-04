---
title: 【前端】深入理解JS Bridge：连接原生与Web的桥梁
categories: 前端
tags:
  - Hybrid App
  - JS Bridge
  - JavaScript
  - Native
  - WebView
---

# 前言

在混合应用（Hybrid App）开发模式中，我们常常需要在原生（Native）代码（如iOS的Swift/Objective-C，Android的Java/Kotlin）和嵌入的WebView中的JavaScript之间进行通信。JS Bridge（JavaScript Bridge）正是实现这种双向通信的关键技术。它像一座桥梁，连接了两个原本隔离的世界，使得Web技术栈可以调用原生功能，原生代码也可以反过来调用或通知Web层。本文将对JS Bridge的原理、实现方式、设计要点及应用场景进行介绍。

# 一、JS Bridge是什么？

JS Bridge 是一种机制，允许在原生应用中嵌入的WebView里的JavaScript代码与原生应用代码进行双向交互。简单来说，它能让：

-   JavaScript 调用 Native 的方法（例如：调用相机、获取设备信息、弹出原生提示框等）。
-   Native 调用 WebView 中的 JavaScript 函数或执行JS代码片段（例如：更新Web页面内容、触发Web事件等）。

这种能力是Hybrid App能够兼具Web开发灵活性和原生功能强大性的基础。

# 二、JS Bridge的核心原理与实现技术

JS Bridge的实现依赖于WebView控件提供的特定接口以及一些巧妙的通信技巧。其核心可以分为"JS调用Native"和"Native调用JS"两个方向。

## （一）JavaScript 调用 Native

主要的实现方式有以下几种：

### 1. 注入API (对象映射/`addJavascriptInterface` - Android)

-   **Android**: 通过WebView的 `addJavascriptInterface(Object object, String name)` 方法，可以将一个Java对象的方法暴露给JavaScript。JavaScript可以直接通过指定的 `name` 来访问这个Java对象及其公开方法。这是Android官方推荐的方式之一，但需要注意安全性问题（特别是Android 4.2以下版本可能存在的远程代码执行漏洞，后续版本已修复）。
    ```java
    // Android Native Code
    public class WebAppInterface {
        Context mContext;
        WebAppInterface(Context c) {
            mContext = c;
        }

        @JavascriptInterface // 必须添加此注解，方法才能被JS调用
        public void showToast(String toast) {
            Toast.makeText(mContext, toast, Toast.LENGTH_SHORT).show();
        }
    }
    // 在Activity中设置
    webView.addJavascriptInterface(new WebAppInterface(this), "AndroidNative");
    ```
    ```javascript
    // JavaScript Code
    if (window.AndroidNative) {
        window.AndroidNative.showToast("Hello from JavaScript!");
    }
    ```

### 2. URL Scheme拦截 (iOS & Android)

-   **原理**：JavaScript通过修改 `window.location.href` 或创建一个隐藏的iframe并设置其src为一个自定义的URL Scheme（例如 `jsbridge://methodName?param1=value1&param2=value2`）。Native端会拦截WebView加载这些特定Scheme的请求，解析出方法名和参数，然后执行相应的原生代码。
-   **iOS**: 在 `UIWebView` (已废弃) 中，可以通过 `webView:shouldStartLoadWithRequest:navigationType:` 代理方法拦截。在 `WKWebView` 中，可以通过 `webView:decidePolicyForNavigationAction:decisionHandler:` 代理方法拦截。
-   **Android**: 可以通过 `WebViewClient` 的 `shouldOverrideUrlLoading(WebView view, String url)` 或 `shouldInterceptRequest(WebView view, WebResourceRequest request)` 方法拦截。

    ```javascript
    // JavaScript Code
    function callNativeFunction(name, params) {
        let scheme = 'jsbridge://';
        let url = scheme + name;
        if (params) {
            let query = Object.keys(params).map(key => key + '=' + encodeURIComponent(params[key])).join('&');
            url += '?' + query;
        }
        // 可以通过创建一个iframe来发送请求，避免页面跳转
        let iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        setTimeout(() => document.body.removeChild(iframe), 0);
    }
    callNativeFunction('getUserInfo', {userId: '123'});
    ```
    Native端则需要解析这个URL，提取方法名和参数。

### 3. `prompt`/`confirm`/`alert` 拦截 (Android)

-   **Android**: 通过重写 `WebChromeClient` 的 `onJsPrompt()`, `onJsConfirm()`, `onJsAlert()` 方法，可以拦截JS中的这些对话框调用。JS可以将要传递给Native的信息作为这些函数的参数，Native拦截后解析并执行相应操作。`onJsPrompt` 因为可以返回一个字符串结果，常被用来实现同步调用（虽然不推荐）。

### 4. `WKScriptMessageHandler` (iOS - WKWebView)

-   **iOS (WKWebView)**: 这是苹果推荐的在 `WKWebView` 中JS调用Native的方式。Native注册一个或多个消息处理器，JS通过 `window.webkit.messageHandlers.<handlerName>.postMessage(<messageBody>)` 发送消息给Native。Native在 `userContentController:didReceiveScriptMessage:` 代理方法中接收消息。
    ```swift
    // iOS Native Code (Swift)
    // 在 WKWebViewConfiguration 中添加 User Script
    let userContentController = WKUserContentController()
    userContentController.add(self, name: "myNativeHandler") // self 需要遵循 WKScriptMessageHandler协议
    let configuration = WKWebViewConfiguration()
    configuration.userContentController = userContentController
    let webView = WKWebView(frame: .zero, configuration: configuration)

    // 实现 WKScriptMessageHandler 协议方法
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "myNativeHandler" {
            if let body = message.body as? [String: Any] {
                print("Received message from JS: \(body)")
                // 处理JS传递过来的数据
            }
        }
    }
    ```
    ```javascript
    // JavaScript Code
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.myNativeHandler) {
        window.webkit.messageHandlers.myNativeHandler.postMessage({ action: "getData", param: "example" });
    }
    ```

## （二）Native 调用 JavaScript

Native层调用JS层相对直接一些：

-   **Android**: WebView提供了 `loadUrl("javascript:yourJavaScriptCodeHere()")` 和 `evaluateJavascript("yourJavaScriptCodeHere()", ValueCallback<String> callback)` 方法。
    -   `loadUrl()`: 直接执行JS代码，但没有返回值，且JS执行必须在主线程。
    -   `evaluateJavascript()`: 异步执行JS代码，并且可以通过 `ValueCallback` 获取JS的执行结果。这是推荐的方式，性能更好，且可以获取返回值。

    ```java
    // Android Native Code
    // 通过 loadUrl
    webView.loadUrl("javascript:showAlert('Hello from Native!')");

    // 通过 evaluateJavascript (推荐)
    webView.evaluateJavascript("javascript:addNumbers(5, 10)", new ValueCallback<String>() {
        @Override
        public void onReceiveValue(String value) {
            // value 是JS执行后的返回值 (例如 "15")
            Log.d("JS_Result", value);
        }
    });
    ```

-   **iOS**:
    -   `UIWebView` (已废弃): 使用 `stringByEvaluatingJavaScriptFromString:` 方法。
    -   `WKWebView`: 使用 `evaluateJavaScript:completionHandler:` 方法。此方法异步执行JS，并通过 `completionHandler` 返回结果或错误。

    ```swift
    // iOS Native Code (Swift)
    webView.evaluateJavaScript("document.getElementById('myElement').innerText = 'Updated by Native';") { (result, error) in
        if let error = error {
            print("JS evaluation error: \(error)")
        }
        if let result = result {
            print("JS evaluation result: \(result)")
        }
    }
    ```

# 三、设计一个健壮的JS Bridge

一个好的JS Bridge设计应该考虑以下几点：

1.  **统一的API接口**：无论JS调用Native还是Native调用JS，都应该有一套规范、易用的API。例如，统一使用 `JSBridge.callNative(module, method, params, callback)` 和 `JSBridge.registerHandler(handlerName, handlerFunction)`。
2.  **异步通信**：大部分原生操作是耗时的，为了不阻塞UI，通信应设计为异步，通过回调函数（Callbacks）或Promises处理结果。
3.  **消息格式统一**：Native与JS之间传递的消息（参数和返回值）最好统一为JSON字符串，便于解析和跨平台。
4.  **回调管理**：JS调用Native后，Native处理完需要回调JS。这时需要一个回调ID机制，JS在发起调用时生成一个唯一ID，并将回调函数与ID关联存起来；Native处理完毕后，将结果和此ID一起传回给JS，JS根据ID找到对应的回调函数执行。
5.  **错误处理**：清晰的错误码和错误信息传递机制，方便调试和用户提示。
6.  **命名空间与模块化**：避免JS全局命名空间污染，可以将Bridge相关方法封装在一个全局对象下（如 `window.JSBridge`）。对于大量API，可以进行模块化管理。
7.  **版本控制与兼容性**：随着业务发展，Bridge API可能会变更。需要考虑版本管理和向后兼容。
8.  **安全性**：
    *   明确哪些Native接口可以暴露给JS。
    *   对JS传入的参数进行校验。
    *   防止恶意JS代码调用未授权的Native功能。
    *   使用HTTPS加载Web资源。
9.  **易用性与可扩展性**：API设计应简单直观，同时方便添加新的接口。

**示例性的JS端Bridge结构可能如下：**

```javascript
(function() {
    if (window.JSBridge) {
        return;
    }

    var messageHandlers = {}; // 存储JS注册供Native调用的方法
    var responseCallbacks = {}; // 存储JS调用Native后的回调函数
    var uniqueId = 1;

    // 供Native调用的，分发消息的入口
    function _dispatchMessageFromNative(messageJSON) {
        var message = JSON.parse(messageJSON);
        var handler;

        if (message.responseId) { // 这是Native对JS调用的响应
            handler = responseCallbacks[message.responseId];
            if (handler) {
                handler(message.responseData);
                delete responseCallbacks[message.responseId];
            }
        } else if (message.handlerName) { // 这是Native主动调用JS注册的方法
            handler = messageHandlers[message.handlerName];
            if (handler) {
                // Native调用JS时，也可能需要JS回调，所以传递一个回调函数给JS的handler
                var callback = null;
                if (message.callbackId) {
                    var nativeCallbackId = message.callbackId;
                    callback = function(responseData) {
                        _sendToNative({ responseId: nativeCallbackId, responseData: responseData });
                    };
                }
                handler(message.data, callback);
            }
        }
    }

    // JS发送消息给Native的底层实现 (需平台适配)
    function _sendToNative(message) {
        var messageString = JSON.stringify(message);
        // Android示例 (通过注入对象)
        if (window.MyNativeInterface && window.MyNativeInterface.postMessage) {
            window.MyNativeInterface.postMessage(messageString);
        }
        // iOS WKWebView示例
        else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.myBridgeHandler) {
            window.webkit.messageHandlers.myBridgeHandler.postMessage(messageString);
        }
        // iOS UIWebView或Android URL Scheme示例 (需要更复杂的实现)
        // else { iframe.src = 'jsbridge://...' }
    }

    window.JSBridge = {
        // JS调用Native
        callNative: function(handlerName, data, callback) {
            var message = { handlerName: handlerName, data: data };
            if (callback) {
                var callbackId = 'cb_' + (uniqueId++) + '_' + new Date().getTime();
                responseCallbacks[callbackId] = callback;
                message.callbackId = callbackId;
            }
            _sendToNative(message);
        },
        // JS注册方法供Native调用
        registerHandler: function(handlerName, handler) {
            messageHandlers[handlerName] = handler;
        },
        // 内部方法，暴露给Native调用，用于接收来自Native的消息
        _handleMessageFromNative: _dispatchMessageFromNative 
    };
})();
```

# 四、JS Bridge的应用场景

-   **调用原生功能**：如调用相机、相册、定位、文件系统、传感器、蓝牙、NFC等。
-   **原生UI交互**：如弹出原生对话框、提示框、选择器，或者控制原生导航栏、标签栏。
-   **数据共享**：Web与Native之间共享用户登录状态、配置信息等。
-   **性能优化**：对于计算密集型或需要高性能渲染的任务，可以由Native完成，然后将结果通知Web。
-   **消息推送与事件通知**：Native接收到推送消息或监听到系统事件后，通过Bridge通知Web层做出相应更新。
-   **增强Web能力**：例如实现离线缓存、自定义网络请求处理等。

# 五、JS Bridge的优缺点

## （一）优点

-   **跨平台开发效率**：核心业务逻辑可以用Web技术实现，一套代码多端运行。
-   **灵活性与热更新**：Web部分可以动态更新，无需发版。
-   **功能扩展性强**：可以充分利用原生平台的强大功能。
-   **体验接近原生**：对于部分UI和交互，可以通过调用原生组件来提升用户体验。

## （二）缺点

-   **性能瓶颈**：JS与Native之间的通信（尤其是大量或频繁的）会有一定的性能开销。序列化/反序列化数据、线程切换等都会消耗时间。
-   **复杂性**：设计和维护一个稳定、高效、安全的JS Bridge本身就有一定复杂度。
-   **调试困难**：跨语言调试不如纯Native或纯Web应用方便。
-   **平台差异**：不同平台（iOS/Android）的WebView实现和JS Bridge机制有差异，需要分别适配，增加了维护成本。
-   **安全性风险**：如果Bridge接口设计不当，可能暴露原生能力给不受信任的JS代码，带来安全隐患。

# 六、总结

JS Bridge是Hybrid App开发模式的基石，它有效地连接了Web和Native两个世界，使得开发者可以融合两者的优势。理解其工作原理、掌握不同平台的实现方式，并设计一个健壮、高效、安全的Bridge，对于开发高质量的Hybrid应用至关重要。随着技术的发展，如React Native的JSI（JavaScript Interface）等新架构也在不断优化这种跨语言通信的效率和体验。

# 七、参考资料

-   WebView (Android Developers)
-   WKWebView (Apple Developer Documentation)
-   各种开源JSBridge框架（如 `WebViewJavascriptBridge` 等）的实现思路。

--- 