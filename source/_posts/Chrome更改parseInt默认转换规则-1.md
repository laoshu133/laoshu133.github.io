---
title: Chrome更改parseInt默认转换规则
tags:
  - Javascript
date: 2013-02-27 23:33:20
---

今天看到Chrome有更新，就升级了，目前最新稳定版本**Chrome 25.0.1364.97 m**，然后很高兴的发现之前的[崩溃BUG](/post/crash_chrome.html)居然已经修复了。

不过很显然新的问题又出来了，不然就不会有这么一篇文章了，下午在弄一个公司培训的PPT，里面需要写到`parseInt`的一个经典陷阱。

首先回顾一下`parseInt(string, radix)`当省略`radix`参数时，大致的解析过程：

*   当`string`以0开头，且后面紧跟x时，按照`parseInt(string, 16)`处理

*   当`string`以0开头，且后面紧跟非x时，按照`parseInt(string, 8)`处理

*   其余统一按照`parseInt(string, 10)`处理

当然强烈建议始终使用`radix`参数

&nbsp;

按照上面的解析规则，`parseInt('010')`很自然应该返回`8` ，不过奇怪的是Chorme返回的居然是`10`，难道最新版Chrome改掉了以前默认的转换规则？

晚上回家又拿Chrome 24.0.1312.56试了一下，发现结果也是一样的（没有更早的版本了），看来Chrome改掉这个规则已经不是一两天了，不知其他浏览器会不会效仿。。。

最后趁着这赶脚，再稍微回顾一下`parseInt`和`parseFloat`转换数字上的区别：

*   `parseFloat`只能转换10进制，而`parseInt`则支持第二个参数`parseInt(string[, radix])`，理论上支持任意进制的数字

*   `parseInt`不能转换科学计数`parseInt('1e2');//1`，`parseFloat('1e2');//100`

*   `parseInt`无法转换省略小数点前面0的数字`parseInt('.1');//NaN`，`parseFloat('.1');//0.1`