---
title: IE11 typeof window.ActiveXObject === &quot;undefined&quot;
tags:
  - Javascript
date: 2013-11-28 11:39:13
---

今天在调一个Applet上传组件，调试IE11时又差点踩坑里了，`typeof window.ActiveXObject`返回`undefined`了。。。

但是`window.ActiveXObject === undefined`又是不成立的。。。

以后靠谱的检测需要换成`window.ActiveXObject === undefined`，客官可以见DEMO页和本人WIN7 IE11下测试结果：

[DEMO页面](/test/ie11_activexobject_test.html)

```javascript
navigator.appName; //Netscape
navigator.userAgent; //Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; rv:11.0) like Gecko
typeof window.ActiveXObject; //undefined
typeof window.ActiveXObject === "undefined"; //true
!!window.ActiveXObject; //false
window.ActiveXObject === undefined; //false
window.ActiveXObject === void 0; //false
window.ActiveXObject == undefined; //true
window.ActiveXObject == void 0; //true
```

另外在[http://www.guokr.com/post/449426/](http://www.guokr.com/post/449426/)看到IE11将`navigator.appName`改成`Netscape`了，引用页面中一句：“IE 10是最后一个appName叫做Microsoft Internet Explorer的网页浏览器了，突然好悲伤。。。”