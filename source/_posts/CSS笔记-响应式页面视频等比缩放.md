---
title: '[CSS笔记]响应式页面视频等比缩放'
tags:
  - HTML/CSS
date: 2014-04-08 17:11:16
---

在响应式布局中我们常用用一下代码来处理图片的自适应宽度

[CODE=css]
img{ height: auto; max-width: 100%;}
[/CODE]

不过对于视频，这个貌似就有心无力了，不过这难不倒我们，
根据CSS规范，`margin` 和 `padding` 在接受百分比值时，其上下值为相对于元素的宽度，于是就有了以下代码：

[CODE=css]
.video{
	height: 0; overflow: hidden; position: relative;
    padding-bottom: 56.25%; /* 16:9 */ 
}
.video video, .video iframe{
	height: 100%; width: 100%;
	position: absolute; left: 0; top: 0;
}
[/CODE]

效果可见：[DEMO页面](http://webdesignerwall.com/demo/responsive-css-tricks/)