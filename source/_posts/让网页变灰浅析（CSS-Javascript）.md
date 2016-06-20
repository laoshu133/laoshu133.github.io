---
title: 让网页变灰浅析（CSS+Javascript）
tags:
  - HTML/CSS
date: 2013-04-26 15:45:33
---

<style type="text/css">.log_item br{ display:none;}</style>

事出自然有因，本文也是如此，雅安，加油！

相信最近不少站长和技术在度娘谷歌“CSS 网页 灰色”

本来觉得这类的介绍网上已经很多了，不想再插一脚了，不过今天忽然有朋友又向我问起，自以为自己很了解的情况下给了几个方案：

1.  **堪称完美级**

    整站换图片，不过就是工作量稍大，还得换回来，要是有会员上传的图就更麻烦了（明显调侃）

2.  **纯CSS实现**

    IE：filter

    Chrome：filter

    效果很不错，实现也简单，不过 FF, OPERA,SAFARI 不支持， 手机端就更不行了
3.  **HTML5 filereader实现去色功能**

    效果良好，而且有不错类库实现了

    代码量稍大，不过低版本浏览器全挂掉
4.  **结合前面两点**

    filter - 略

    grayscale.js - [http://james.padolsey.com/javascript/grayscaling-in-non-ie-browsers](http://james.padolsey.com/javascript/grayscaling-in-non-ie-browsers)

    缺点：

    如果页面图片量很大，图片加载时间很很长，页面可能会出现闪屏

    然后，JS本来效率就偏低，所以处理大量图片，自然页面会卡

然后在自己小得意的时候，朋友发过来一段（说是同事给的）：
[code=css]
html{ 
    filter: url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'grayscale\'><feColorMatrix type=\'matrix\' values=\'0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0\'/></filter></svg>#grayscale");
    filter:gray;
    -webkit-filter: grayscale(100%);
}
[/code]

乍一看，虽然让我想起了还有SVG这么个东西可以使，不过估计也就IE和Chrome行吧，印象中真没记得FF有支持`filter`，然后打开FF测试了下，还真可以。

然后自己也动手去谷歌了下，才想上面的代码出处应该是在这里：[http://www.karlhorky.com/2012/06/cross-browser-image-grayscale-with-css.html](http://www.karlhorky.com/2012/06/cross-browser-image-grayscale-with-css.html)

后面又发现在stackoverflow上也有讨论：[http://stackoverflow.com/questions/609273/convert-an-image-to-grayscale-in-html-css](http://stackoverflow.com/questions/609273/convert-an-image-to-grayscale-in-html-css)

然后又找了些资料，总结方案如下：
[code=css]
html{
	/*
	* SVG，不建议单独SVG文件
	* 会增加一次请求，如果支持SVG基本data:基本也就没压力了，如下 
	* SVG文件：http://www.laoshu133.cn/test/grayscale.svg
	*/
	/* filter: url(grayscale.svg#grayscale); */ 
	/* 
	* 有哥们研究说SVG的支持情况如下：
	* http://www.fettblog.eu/blog/2012/06/11/forcing-chrome-to-print-all-pages-in-grayscale/
	* SVG version for IE10, Chrome 17, FF3.5, Safari 5.2 and Opera 11.6 -- does not, need to be prefixed. See below
	* 不过我测试了下IE10(WIN7&WIN8)都不支持，所以基本兼容情况如下：
	* Chorme 25/26不支持，手上没有更低版本的Chorme测试
	* FF3.5+ 
	*/
	filter:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxmaWx0ZXIgaWQ9ImdyYXlzY2FsZSI+PGZlQ29sb3JNYXRyaXggdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAuMzMzMyAwLjMzMzMgMC4zMzMzIDAgMCAwLjMzMzMgMC4zMzMzIDAuMzMzMyAwIDAgMC4zMzMzIDAuMzMzMyAwLjMzMzMgMCAwIDAgMCAwIDEgMCIvPjwvZmlsdGVyPjwvc3ZnPg==#grayscale);
	/* Webkit only, Chrome & Safari 6+ */
	-webkit-filter:grayscale(100%);
	/* future-proof */
	filter:grayscale(100%);
	/* IE4-8 and 9 (deprecated). */
	filter:gray;
}
[/code]

从上面注释基本可以看出对于IE10和低版本Opera CSS处理基本就是没折了；

以上代码使用时属性顺序不能调换；

以上选择器建议html或作用于html上，否则在IE下可能会看到部分元素依旧彩色，当然IE9无论怎样都处理的不是很好

说了这么多，我们来实践下：
<div id="demo_code_grayscale_css" class="demo_code"><textarea id="demo_code_txt">.grayscale{filter:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxmaWx0ZXIgaWQ9ImdyYXlzY2FsZSI+PGZlQ29sb3JNYXRyaXggdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAuMzMzMyAwLjMzMzMgMC4zMzMzIDAgMCAwLjMzMzMgMC4zMzMzIDAuMzMzMyAwIDAgMC4zMzMzIDAuMzMzMyAwLjMzMzMgMCAwIDAgMCAwIDEgMCIvPjwvZmlsdGVyPjwvc3ZnPg==#grayscale);-webkit-filter:grayscale(100%);filter:grayscale(100%);filter:gray}</textarea>
<div class="demo_btns">	<button class="run">点击灰掉当前页</button>
</div><script type="text/javascript" src="/themes/Ceedo/js/jquery.min.js"></script>
<script type="text/javascript">jQuery(function($){var style,garyed=false,docElem=$('html'),shell=$('#demo_code_grayscale_css');shell.find('button.run').bind('click',function(){if(!style){var css=shell.find('textarea').val();style=document.createElement('style');style.type='text/css';if(style.styleSheet){style.styleSheet.cssText=css;}else{style.innerHTML=css;}$('head').prepend(style);}if(!garyed){docElem.addClass('grayscale');this.innerHTML='恢复当前页面';}else{docElem.removeClass('grayscale');this.innerHTML='灰掉当前页';}garyed=!garyed;});});</script>
</div>

来张美女看效果：

![3D Girl](/upload/3d_girl.jpg)

到了这里，在找资料的过程还发现一个Future-filter的测试页，可以看看未来的filter，下面还有”Filtered Video“ ^O^

[http://davidwalsh.name/demo/css-filters.php](http://davidwalsh.name/demo/css-filters.php)

&nbsp;

OK，上面说的都是CSS解决方案，我前面还说了有JS的解决方案；主要说下`grayscale.js`的，如果自己去写原生JS解决，看后可以自己动手试试

项目地址：[http://james.padolsey.com/javascript/grayscaling-in-non-ie-browsers/](http://james.padolsey.com/javascript/grayscaling-in-non-ie-browsers/)

首先，`grayscale.js`不是兼容所有浏览器，看其主页的标题：《“Grayscaling” in non-IE browsers》 ，解决方案并不适应于IE，至少是低版本的IE

然后DEMO效果在此：[http://james.padolsey.com/demos/grayscale](http://james.padolsey.com/demos/grayscale)

最后来`grayscale.js`的用法：
[code=javascript]
var el = document.getElementById( 'myEl' );
grayscale( el );

// Alternatively, pass a DOM collection
// (all elements will get "grayscaled")
grayscale( document.getElementsByTagName('div') );

//可作用于jQuery
// Even works with jQuery collections:
grayscale( $('div') );
//To reset an element (back to its original colourful state) you must call grayscale.reset() and pass whatever elements you want reset:
grayscale.reset( el );
// reset() also accepts DOM/jQuery collections
grayscale.reset( $('div') );

//预处理，主要用于大图片
//The ‘prepare’ function, as discussed earlier, should be called when there’s a large image to process or even if there are several smaller images. Be aware that larger images will take quite a while to process (just a 300×300 PNG takes about 3 seconds in ‘prepare’ mode).
grayscale.prepare( document.getElementById('myEl') );
// Also accepts DOM/jQuery collections
grayscale.prepare( $('.gall_img') );
[/code]

来演示一下：
[code=javascript]
grayscale(document.body);
[/code]
<div id="demo_code_grayscale_js" class="demo_code"><div class="demo_btns">	<button class="run">点击灰掉当前页</button>
</div><script type="text/javascript" src="/Lab/js/grayscale/grayscale.js"></script>
<script type="text/javascript">jQuery(function($){var garyed=false,shell=$('#demo_code_grayscale_js');shell.find('button.run').bind('click',function(){if(!garyed){grayscale(document.body);this.innerHTML='恢复当前页面';}else{grayscale.reset(document.body);this.innerHTML='灰掉当前页';}garyed=!garyed;});});</script>
</div>

来张美女看效果：

![3D Girl](/upload/3d_girl.jpg)

&nbsp;
> _参考：_
> 
> *   [http://davidwalsh.name/css-filters](http://davidwalsh.name/css-filters)
> *   [http://www.fettblog.eu/blog/2012/06/11/forcing-chrome-to-print-all-pages-in-grayscale/](http://www.fettblog.eu/blog/2012/06/11/forcing-chrome-to-print-all-pages-in-grayscale/)
> *   [http://stackoverflow.com/questions/609273/convert-an-image-to-grayscale-in-html-css](http://stackoverflow.com/questions/609273/convert-an-image-to-grayscale-in-html-css)
> *   [http://www.karlhorky.com/2012/06/cross-browser-image-grayscale-with-css.html](http://www.karlhorky.com/2012/06/cross-browser-image-grayscale-with-css.html)
> *   [http://james.padolsey.com/javascript/grayscaling-in-non-ie-browsers/](http://james.padolsey.com/javascript/grayscaling-in-non-ie-browsers/)