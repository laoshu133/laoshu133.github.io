---
title: CSS兼容背景透明处理
tags:
  - HTML/CSS
date: 2013-09-03 00:43:27
---

<style type="text/css">br{ display:none}</style>

说到CSS背景半透明，各位CSSer肯定都不陌生，写过页面的大部分都干过这个事情，尤其是CSS2时代走过来的。

老题新解，现在已经步入CSS3时代了，对于处理CSS背景半透明应该已经不是很难的事了，不过请不要忘了咱在天朝，IE6的份额依旧不少， [查看份额](http://www.ie6countdown.com/)。

不扯，入正题，先看[完整DEMO](/Lab/bg_transparence_test.html)：

### opacity + filter:alpha

大部分情况下我们做背景透明都是这么写的，代码简单，写起来也方便；不过大部分情况是需要多增加一个标签，因为这么写会连文字一起透明
[CODE=css]
.opacity .test{ background:#fff; opacity:.4; filter:Alpha(opacity=40);}
[/CODE]

### Rgba + filter:progid:DXImageTransform.Microsoft.Gradient

首先说说`background:rgab/hsla`，这两个新的颜色函数都能定义alpha通道值，然后可以使得背景半透明，甚至还可以使用CSS3`gradient`的渐变函数，生成更为复杂的背景，具体请自行谷歌；

在CSS2后面某个时候，有童鞋发现了`filter:progid:DXImageTransform.Microsoft.Gradient`IE下能通过渐变滤镜去模拟背景透明，而不用文字透明

当然，有利必然有弊，这么写，代码略长，写起来麻烦：

IE滤镜采用AARRGGBB（16进制）进行排列，AA位值也为 00-FF，也就是说10进制需要转成16进制

计算规则 `10进制值*256/100`然后再转16进制，就是说如果设置0.4的透明度`0.4*256/100 = 102.4`转16进制为`66`
[CODE=css]
.rgba .test{ background:rgba(255,255,255,.4); background:none\9; filter:progid:DXImageTransform.Microsoft.Gradient(startColorStr=#66FFFFFF,endColorStr=#66FFFFFF);}
[/CODE]

### Rgba with last-child

上面背景透明的实现已经是本文的核心部分，但是如果你够细心，会发现此效果在IE9下透明度明显不对，

IE9当background:rgba和filter同时使用时，会出现两个效果叠加，

不过我们可以用:last-child巧妙修复；因IE6不支持 :first/last-child伪类，IE7,8-仅支持:first-child伪类，IE9+全部支持
[CODE=css]
.rgba_with_lastchild .test{ background:none; filter:progid:DXImageTransform.Microsoft.Gradient(startColorStr=#66FFFFFF,endColorStr=#66FFFFFF);}
.rgba_with_lastchild .test:last-child{ background:rgba(255,255,255,.4); filter:none;}
[/CODE]

当看到此处的时候，应该本文应该是能结尾了，因为上面的效果在各个浏览器下已经接近完美了，不过还有个不得不说的密码

### Filter with overflow

IE7- 当使用滤镜时，大部分情况会使得元素具有 overflow:hidden 特性，具体请见[DEMO最后](/Lab/bg_transparence_test.html)

全文完，欢迎拍砖。

最后在放一次[DEMO地址](/Lab/bg_transparence_test.html)