---
title: 7行崩掉(Crash)Chrome
tags:
  - 其他
date: 2012-10-23 21:08:29
---

升级到**Chrome 25.0.1364.97 m**，此BUG已经修复

昨天在写页面时，无意间写了一个`ul>li>input:file`的结构，然后`li`左浮动（实际后面发现左/右浮动是一样的）`li{float:left;}`，`li`的上级有一个很经典的`.clearfix`，在然后发现Chrome居然崩溃了，崩溃了。。。

然后今天特意花了点时间来重现我们万能的Chrome的BUG（别的平台均未重现，包括Safari），最后发现通过如下7行代码，可以轻松重现：

*   测试环境：WIN7/XP/MAC 20.0.1132.57 m/22.0.1229.94 m
*   重现条件：CSS部分缺一不可，HTML结构随意，input一定要是file
*   具体原因未知

```html
<style type="text/css">
.clearfix:after{ content:""; display:block;}
.clearfix li{ float:left;}
</style>

*   <input type="file" />```

废话不多，给出[DEMO地址](/Lab/crash_chrome/)，欢迎拍砖。