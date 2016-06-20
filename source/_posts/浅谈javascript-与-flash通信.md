---
title: 浅谈javascript 与 flash通信
tags:
  - Javascript
date: 2011-10-21 09:51:46
---

最近在弄一个小游戏，玩游戏总要有点声音的，然后选择了用Flash出声，在做JS与Flash通信的时候，又一次被externalInterface.addCallback 和 embed 标签坑了，详情如下：

Flash设计的是 5 帧， 后面4帧每帧一个声音，然后用脚本控制播放，在最开始的时候，JS调用Flash原生的Play()方法，在各个浏览器下面都表现相当不错，接着使用如下AS脚本为JS添加回调，
```javascript
//导入包
import flash.external.*;
//允许哪些域访问
system.Security.allowDomain("*");

var
//提供JS访问的函数名
methodName:String = "playSound",
//指定本地函数中this变量的作用域，可设置为null留空
self:Object = this,
//AS内部函数名
soundMap = {
	down : 2,
	win : 3,
	draw : 4,
	lose : 5
},
playSound:Function = function(type){
	if(!!soundMap[type]){
		this.gotoAndStop(soundMap[type]);
		this.gotoAndStop(1);
	}
},
//将函数注册到容器列表
//这里需要检测是否注册成功，因为如果是从缓存读取的，不一定是在flash完全load之后才执行此处
regRet:Boolean = false,
regFn = function(){
	regRet = ExternalInterface.addCallback(methodName, self, playSound);
	if(regRet){
		return regRet;	//注册成功
	}
	//注册失败，重新注册
	setTimeout(regFn, 500);
};
regFn();
```

这里我还特意规避了一个以前弄一个[JS剪贴板](/Lab/tester/)时遇到的一个问题，如果Flash是从缓存加载，有可能在调用ExternalInterface.addCallback()时，Flash还未加载完成，造成接口注册失败的问题，然而不幸的事情依旧还是发生了，此方法在IE下面表现良好，但是到了FF等下面，Flash依旧不来米，然后又经过了N个小时排查，总算找到了问题所在，又是因为IE和别的浏览器显示Flash用的模式不一致，我在调用Flash的时候一般用的自己写的一个[小JS库](/ds/flash.js)，输出Flash，在做输出HTML的时候，默认参数是设置Flash的 `wmode="transparent"`，因为这样能避免DIV盖不住Flash之类的问题，结果没想到这样居然也会让Flash接口失效.
<p>最后这里的解决办法自然也就了然了，设置 `wmode="window"`，顺利解决问题，仅此小记一笔。