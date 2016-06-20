/********页面全局函数********/

//获取当前屏幕的 W,H
var ss=function(){return{width:self.innerWidth || (document.documentElement.clientWidth || document.body.clientWidth),
height:self.innerHeight || (document.documentElement.clientHeight || document.body.clientHeight)}}

//是否为IE浏览器
var isIE=(navigator.appName.indexOf('Microsoft')!=-1)?true:false;