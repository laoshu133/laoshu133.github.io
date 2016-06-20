---
title: '[CSS笔记]绝对定位居中(Absolute Centering)'
tags:
  - HTML/CSS
date: 2014-04-08 16:51:36
---

我们经常用 `margin:0 auto` 来实现水平居中，而一直认为 `margin:auto` 不能实现垂直居中……实际上，实现垂直居中仅需要声明元素高度和下面的CSS：

[CODE=css]
.Absolute-Center {
  margin: auto;
  position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
}
[/CODE]

其兼容情况为：Modern & IE8+
原理&DEMO： [英文](http://s.codepen.io/shshaw/fulldetails/gEiDt) [中文](http://blog.csdn.net/freshlover/article/details/11579669)