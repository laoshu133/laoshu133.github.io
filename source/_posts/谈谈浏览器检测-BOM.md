---
title: 谈谈浏览器检测 BOM
tags:
  - Javascript
date: 2011-09-02 18:46:21
---

在谈到浏览器检测的时候，相信很多同学都会说这是一个很老的话题了，而且首先想到的肯定就是检测 navigator.userAgent，然后再想到的肯定就是对于IE这个庞大的体系的HACK。

简单展示一下几个浏览器的userAgent:

IE7 - Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0)
<p>IE9 - Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)
<p>Chrome12 - Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.122 Safari/534.30
<p>FF6 - Mozilla/5.0 (Windows NT 6.1; rv:6.0.1) Gecko/20100101 Firefox/6.0.1

很明显，其中的规律不是难发现，浏览器的版本MSIE 7.0，&nbsp;Chrome/12.0.742.122，要么是跟在&quot;/&quot;后面，要么是跟在空格后面，所以下面给出我的实现方案：
```javascript
(function(names){
	var rword = /[^, \|]+/g, brows = {};
	names.replace(rword, function(name){ brows[name] = 0;});
	if(new RegExp('(' + names + ')[ \\/](\\d+)\\.').test(navigator.userAgent)){
		brows[RegExp.$1] = parseInt(RegExp.$2, 10);
	}
	return {
		browser : brows,
		ieVer : function(ver){
			var _ver = this.browser.IE;
			return isNaN(ver) ? _ver : _ver == ver;
		}
	};
})('Chrome|Firefox|IE|Opera|Safari')
```

不过对于IE系列一些HACK已知没有停止过，类似一些比较常用的：
<p>是否为：IE - !+[1,] (在IE9下已经失效)，!+'\v1'  (lt IE9不支持垂直制表符，同样IE9已经失效)
<p>另外给出 司徒正美总结的[一些检测方案](http://www.cnblogs.com/rubylouvre/archive/2009/10/14/1583362.html) ，

从上面不难看出，HACK检测方案都是不安全的，随着浏览器的的升级很可能HACK就处问题了。
<p>对于基础的检测，我给出的方案应该能胜任了，希望能看到更好的解决方案，等有时间再给出JQ的browser模块。