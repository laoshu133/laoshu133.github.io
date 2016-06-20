---
title: CSS 背景居中次像素无法重合
tags:
  - HTML/CSS
date: 2012-08-08 12:26:03
---

又见CSS BUG，昨天赶工写完一个页面，专题页面，又需要重用，没花太多时间处理细节上的东西，因为大部分模块都可以直接替换；今天早上同事和我说：“Safari 下面背景是不是有1px偏移？”，听完觉得挺奇怪，一般不应该存在这样的问题的，然后一看就有了这篇文章

首先重现BUG(此Demo仅CSS3支持，Chrome/Safari最佳)：
<style type="text/css">.t_shell{ border:1px solid #ddd; margin-bottom:15px; padding:20px 0 0; width:500px; position:relative;}.t_wrap{ background:#eee; margin:0 auto 20px; width:401px;}.t_wrap:before{ content:'.t_wrap'; position:absolute;}.t_panel{ background: #299a0b;background: -moz-linear-gradient(top, #299a0b 0%, #299a0b 100%);background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#299a0b), color-stop(100%,#299a0b));background: -webkit-linear-gradient(top, #299a0b 0%,#299a0b 100%);background: -o-linear-gradient(top,  #299a0b 0%,#299a0b 100%);background: -ms-linear-gradient(top,  #299a0b 0%,#299a0b 100%);background: linear-gradient(to bottom,  #299a0b 0%,#299a0b 100%);filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#299a0b', endColorstr='#299a0b',GradientType=0 );}.t_inner{ background: #cf0404;background: -moz-linear-gradient(top, #cf0404 43%, #ff3019 100%);background: -webkit-gradient(linear, left top, left bottom, color-stop(43%,#cf0404), color-stop(100%,#ff3019));background: -webkit-linear-gradient(top,  #cf0404 43%,#ff3019 100%);background: -o-linear-gradient(top,  #cf0404 43%,#ff3019 100%);background: -ms-linear-gradient(top,  #cf0404 43%,#ff3019 100%);background: linear-gradient(to bottom,  #cf0404 43%,#ff3019 100%);filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#cf0404', endColorstr='#ff3019',GradientType=0 );}.t_panel{ background-repeat:no-repeat; background-size:200px 120px; background-position:50% 20px; padding:140px 0 0 0; height:140px;}/*.t_panel:before{ content:'.t_panel'; position:absolute; width:100%;}*/.t_inner{ background-repeat:no-repeat; margin:0 auto; height:120px; width:200px;}.t_inner:before{ color:#fff; content:'.t_inner'; position:absolute;}.t_btns{ border-top:1px solid #ddd; padding:10px 20px;}.t_btns button{ padding:5px;}</style>
<div class="t_shell">	<div class="t_wrap">		<div class="t_panel">			<div class="t_inner" title=".t_inner"></div>		</div>	</div>	<div class="t_btns"><button onclick="var el=$('.t_wrap'); el.width(el.width()+3);">.t_wrap width +3px</button><button onclick="var el=$('.t_wrap'); el.width(el.width()-3);">.t_wrap width -3px</button></div></div>```html
<div class="t_shell">	<div class="t_wrap">		<div class="t_panel">			<div class="t_inner" title=".t_inner"></div>		</div>	</div></div>```
```css
.t_wrap{ background:#eee; margin:0 auto; width:401px;}
.t_panel{ background:-webkit-linear-gradient(top, #299a0b 0%,#299a0b 100%) no-repeat; background-position:50% 20px; padding:140px 0 0 0; height:140px;}
.t_inner{ background:-webkit-linear-gradient(top, #cf0404 43%,#ff3019 100%); margin:0 auto; height:120px; width:200px;}
```

点击“.t_wrap width +3px”按钮增加(div.t_wrap)宽度时候，能够很明显的看到绿色块(div.t_panel)有1px左右的来回摆动。

出现以上BUG的原因，国外“ACKO”给出的原因如下：

*   The width of the viewport

*   The odd/even size of the box/element

*   Background image is bigger/smaller than the viewport

*   Background image is padded evenly/unevenly around the box (1px difference). (*)> (*) Note that there is a choice whether to pad more on the left or on the right. I chose the left. This means that the last 4 rows of test cases are inherently ambiguous: a browser that misaligns all of these in the same fashion is in fact being consistent, just in the opposite direction.

原文地址：[Sub-pixel-background-misalignments](http://acko.net/blog/css-sub-pixel-background-misalignments/)

解决方案：

在我测试过程中，发现基本上只要上面给出原因前面两条不出现，**即：宽度不跟随视图变化，容器的宽度适中为偶数或者奇数；就可以有效避免**

另外，在查找资料的过程中，发现另外一个解决方案，不过我根据我测试的好像不是很给力，当视图宽度变化时，依然能重现：
```css
@media screen and (-webkit-min-device-pixel-ratio:0){
	.t_panel{ background-position:50.001% 20px;}
}
```

原文地址：[Fixing-Safari-1px-background-image-centering-problem](http://philfreo.com/blog/fixing-safaris-1px-background-image-centering-problem/)