---
title: '[JS笔记] javascript base64 Encode, Decode'
tags:
  - Javascript
date: 2014-11-20 21:54:34
---

以下方案仅限于浏览器环境！

浏览器内置的方法 `atob, btoa` 仅能处理 utf-8 编码的 ascii 字符，不能直接作用于 Unicode 字符串，所以需要搞定 utf-8 编码，解码：

```javascript
// utf-8 encode, decode
function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
    return decodeURIComponent(escape(s));
}
```

来源：[http://ecmanaut.blogspot.jp/2006/07/encoding-decoding-utf8-in-javascript.html](http://ecmanaut.blogspot.jp/2006/07/encoding-decoding-utf8-in-javascript.html)
另：[关于URL编码](http://www.ruanyifeng.com/blog/2010/02/url_encoding.html)

然后 base64 自然就有了：

```javascript
// base64, encode, decode
function base64Encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function base64Decode(str) {
    return decodeURIComponent(escape(atob(str)));
}

// utf-8 encode, decode
function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
    return decodeURIComponent(escape(s));
}
```

兼容情况如下：
<dl>    <dt>Win32</dt>    <dd>

*   Firefox 1.5.0.6
*   <del>Firefox 1.5.0.4</del>
*   <del>Internet Explorer 6.0</del><span style="color: #cccccc;">.2900.2180</span>
*   Opera 9.0<span style="color: #cccccc;">.8502</span>    </dd>    <dt>MacOS</dt>    <dd>

*   Camino <span style="color: #cccccc;">2006061318</span> (1.0.2)
*   Firefox 1.5.0.4
*   Safari 2.0.4 (419.3)</dd></dl>
当然，依然存在可能失败的情况。
具体请参考 [https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding](https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Solution_.231_.E2.80.93_escaping_the_string_before_encoding_it)