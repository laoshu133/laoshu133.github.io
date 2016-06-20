---
title: javascript位运算转整型存在风险
tags:
  - Javascript
date: 2013-07-11 17:28:52
---

上午看到司徒正美发的博文，[《javascript 的位操作符转换推断》](http://www.cnblogs.com/rubylouvre/p/3183616.html)，看的时候自己也觉得推断的挺好的；不过刚好下午写了一个团购倒计时页面，同事拿过去用之后，发现时间过长会出现倒计时不走的情况，伪代码如下
[CODE=javascript]
var timer, timeout = ~~elem.getAttribute('data-timeout');
if(timeout > 0){
	timer = startTimeout(timeout, function(queue){
		//...
	});
}
[/CODE]

其中的`~~elem.getAttribute('data-timeout')`（`elem.getAttribute('data-timeout')|0`，效果相同）就是偷懒的方式去强制转整型，其类似的等价于`parseInt(elem.getAttribute('data-timeout'),10)||0`，以前一直认为是等价的，但是现在只能说是类似等价。

但是同事输出的数值为：2703986000，在断点调试时，发现没有进`if`也就是说转换或的数值小于0了，为了验证做了如下测试：
[CODE=javascript]
~~'2703986000'; //-1590981296

'2703986000' | 0; //-1590981296

parseInt('2703986000'); //2703986000

~~'-15909812967'; //1270056217

'-15909812967' | 0; //1270056217

parseInt('-15909812967', 10); //-15909812967
[/CODE]

测试发现位运算强制转整型有边界值，而且边界值小于`Number.MAX_VALUE`，并且大于`Number.MIN_VALUE`，所以当在处理大数值的时候，使用位运算是有风险的；

然后又做部分测试，求了一下位运算的边界值（对位运算不了解，可能与平台也有关系）
[CODE=javascript]
~~'2147483647'; //2147483647

~~'2147483648'; //-2147483648

~~'-2147483648'; //-2147483648

~~'-2147483649'; //2147483647
[/CODE]

其实仔细看的话，上面还是有规律的；涉及到位运算，不对之处请拍砖！