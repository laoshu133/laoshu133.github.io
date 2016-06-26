(function() { 
var 
window = this, 
undefined, 
//整体
ds=window.$d=window.ds=function(selector){
	if(selector instanceof ds.fn.init) return selector;
	return new ds.fn.init(selector);
}
ds.$D=window.$D=function(tag){return document.getElementsByTagName(tag);}
//常用属性
ds.isIE=!+[1,];
ds.isIE6=navigator.userAgent.toLowerCase().indexOf("msie 6.0") != -1;
ds.isFF=navigator.userAgent.toLowerCase().indexOf("firefox")!=-1;
//返回文档的大小
ds.size=function(){
	return {width:(document.documentElement.clientWidth || document.body.clientWidth)||self.innerWidth,
	  height:document.documentElement.clientHeight ||self.innerHeight || document.body.clientHeight};
}
//返回当前滚动条的位置
ds.scroll=function(){
	return {left:(document.documentElement.scrollLeft || document.body.scrollLeft),
			top:(document.documentElement.scrollTop || document.body.scrollTop)}
}
//常用方法
//判断是否为函数
ds.isFunction=function(obj){return Object.prototype.toString.call(obj) === "[object Function]";}
ds.cacheBg=function(){ if(ds.isIE) document.execCommand("BackgroundImageCache", false, true);}

/*by 司徒正美*/
ds.readydom=[];
ds.ready=function(fn){
	ds.ready.isReady=false;
	ds.ready.init=function(){
		if (document.addEventListener) {
			document.addEventListener( "DOMContentLoaded", function(){
				document.removeEventListener( "DOMContentLoaded", arguments.callee, false );//清除加载函数
				ds.ready.fireReady();
			}, false );
		}else{
			if (document.getElementById) {
				document.write("<script id=\"ie-domReady\" defer='defer' src=\"//:\"><\/script>");
				document.getElementById("ie-domReady").onreadystatechange = function() {
					if (this.readyState === "complete") {
						ds.ready.fireReady();
						this.onreadystatechange = null;
						this.parentNode.removeChild(this)
					}
				};
			}
		}
	}
	ds.ready.fireReady=function(){
		if (ds.ready.isReady) return;
		ds.ready.isReady = true;
		for(var i=0,n=ds.readydom.length;i<n;i++){
			var fn = ds.readydom[i];
			fn();
		}
		ds.readydom.length = 0;//清空事件
	}
	ds.ready.init();//如果没有建成DOM树，则走第二步，存储起来一起杀
	if(typeof fn!='undefined' && ds.isFunction(fn)){
		if(ds.isReady){
			fn();//如果已经建成DOM，则来一个杀一个
		}else{
			ds.readydom.push(fn);//存储加载事件
		}
	}
}
//事件
ds.event={
	on:function(o,type,fn){
		if(o.attachEvent){
			var pri=type+'_'+fn
			fn[pri]=function(){
				fn.call(o,window.event);
			}
			o.attachEvent('on'+type,fn[pri]);
		}else if(o.addEventListener){
			o.addEventListener(type,fn,false);
		}else;
	},
	un:function(o,type,fn){
		if(o.detachEvent){
			o.detachEvent('on'+type,fn[type+'_'+fn]);
		}else if(o.removeEventListener){alert(o.removeEventListener);
			o.removeEventListener(type,fn,false);
		}else;
	},
	//阻止事件冒泡
	stopPop:function(e){
		if(e && e.stopPropagation) {
			e.stopPropagation(); //非IE
		}else{
			window.event.cancelBubble = true; 
		} 
	},
	//取消浏览器默认行为
	stop:function(e){
		if(e && e.preventDefault){
			e.preventDefault();  //非IE
		}else{
			window.event.returnValue = false; 
			return false; 
		}
	},
	target:function(e){
		return e.target || e.srcElement;
	},
	pos:function(e){
		if (e.pageX || e.pageY) {
			return {
				x: e.pageX,
				y: e.pageY
			};
		}
		return {
			x: e.clientX + ds.scroll().left,
			y: e.clientY + ds.scroll().top
		};
	}
}

//获取url中的值
ds.getstr=function(vl,url){
	if(url=(typeof(url)==='undefined')) url=location.search;
	if(url.indexOf("?")==-1) return '';
	else url=url.substring(1).split('#')[0];
	var vls=url.split('&');
	for(var i=0; i<vls.length; i++){
		if(vl==vls[i].split("=")[0]){
			return unescape(vls[i].split("=")[1]);
		}
	}
	return "";
}

/***对象扩展***/
ds.fn=ds.prototype={
	//init
	init:function(selector){
		this[0]=typeof selector!="object"?document.getElementById(selector):selector;
		return this;
	},
	length:0,
	//返回DOM元素
	get:function(index){
		return this[0];
	},
	$D:function(n){
		return this[0].getElementsByTagName(n);
	},
	//遍历
	each:function(callback){
		
		callback(this[0],0);
	},
	prop:function(n,vl){
		var o=this[0];
		if(typeof vl!="undefined"){
			o[n]=vl;
		}else{
			return o[n];
		}
		return this;
	},
	//获取或设置HTML
	html:function(vl){
		return this.prop('innerHTML',vl);
	},
	//获取、设置对象文本
	text:function(vl){
		return this.prop(this[0].innerText?"innerText":"textContent",vl);
	},
	//获取、设置元素的属性
	attr:function(n,vl){
		var o=this[0];
		var b=typeof vl!="undefined";
		switch(n){
			case "style":
				if(b) o.style.cssText=vl;
				else res=o.style.cssText;
				break;
			case "class":
				if(b) o.className=vl;
				else res=o.className;
			case "for":
				if(b) o.setAttribute(ds.isIE?"htmlFor":"for",vl);
				else res=o.getAttribute(ds.isIE?"htmlFor":"for");
			default:
				if(b) o.setAttribute(n,vl);
				else res=o.getAttribute(n);
		}
		if(b) return this;
		else return res;
	},
	//获取、设置表单元素的值
	val:function(vl){
		if(typeof vl!="undefined") this.prop('value',vl);
		else return this.prop('value');
		return this;
	},
	//CSS操作
	css:function(n,vl){
		if(typeof n==="object"){
			for(var k in n)
				this.css(k,n[k]);
		}else{
			var b=typeof vl!="undefined";
			if(n=='float') n=ds.isIE?'styleFloat':'cssFloat';
			if(b){
				this.each(function(o){
					if(n=="opacity"){
						if(ds.isIE) o.style.filter = 'Alpha(Opacity=' + vl * 100 + ');';
						else o.style.opacity=vl;
					}else
						o.style[n]=vl;
				});
			}else{
				var o=this[0];
				if(n=='opacity'){
					return ds.isIE?o.filters.alpha?parseFloat(o.filters.alpha.opacity/100):1 : o.style.opacity?o.style.opacity:1;
				}else
					return o.currentStyle?o.currentStyle[n]:document.defaultView.getComputedStyle(o,null)[n];
			}
		}
		return this;
	},
	addClass:function(vl){
		var o=this[0],s=o.className;
		if(o && s.indexOf(vl)==-1){
			if(s!='' &&  s.substring(s.length-1)!=' ') s+=' ';
			s+=vl;
			o.className=s;
		}
		return this;
	},
	removeClass:function(vl){
		var o=this[0];
		if(o && o.className.indexOf(vl)!=-1){
			var re=new RegExp('\s*'+vl+'\s*');
			o.className=o.className.replace(re,'');
		}
		return this;
	},
	hasClass:function(vl){
		return this[0].className.indexOf(vl)!=-1;
	},
	//获取，设置元素的w,h
	width:function(vl){
		var o=this[0];
		if(vl) o.style.width=vl+'px';
		else return o.offsetWidth;
		return this;
	},
	height:function(vl){
		var o=this[0];
		if(vl) o.style.height=vl+'px';
		else return o.offsetHeight;
		return this;
	},
	innerWidth:function(){
		var o=this;
		var w=o.width();
		var bl=o.css('borderLeftWidth'),br=o.css('borderRightWidth');
		var pl=o.css('paddingLeft'),pr=o.css('paddingRight');
		return w-parseInt(bl)-parseInt(br)-parseInt(pl)-parseInt(pr);
	},
	innerHeight:function(){
		var o=this;
		var h=o.height();
		var bt=o.css('borderTopWidth'),btm=o.css('borderBottomWidth');
		var pt=o.css('paddingTop'),ptm=o.css('paddingBottom');
		return h-parseInt(bt)-parseInt(btm)-parseInt(pt)-parseInt(ptm);
	},
	outerWidth:function(){
		var o=this;
		var w=o.width();
		var ml=o.css('marginLeft'),mr=o.css('marginRight');
		return w+parseInt(ml)+parseInt(mr);
	},
	outerHeight:function(){
		var o=this;
		var h=o.height();
		var mt=o.css('marginTop'),mtm=o.css('marginBottom');
		return h+parseInt(mt)+parseInt(mtm);
	},
	//显示隐藏元素
	hidden:function(){
		this.each(function(o){ o.style.display='none';});
		return this;
	},
	show:function(vl){
		this.each(function(o){ o.style.display=vl?vl:'';});
	},
	toggle:function(){
		this[this.css('display')=='none'?'show':'hidden']();
		return this;
	},
	//返回元素位置
	pos:function(){
		var left = 0, top = 0,
            el = this[0],
            de = document.documentElement,
            db = document.body,
            add = function(l, t){
                left += l || 0;
                top += t || 0;
            };
		if(el == document.body){
			if (typeof(window.pageYOffset) == 'number') {
				top = window.pageYOffset;
				left = window.pageXOffset;
			}
			else
				if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
					top = document.body.scrollTop;
					left = document.body.scrollLeft;
				}
				else
					if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
						top = document.documentElement.scrollTop;
						left = document.documentElement.scrollLeft;
					}
		} else {
			if(el.getBoundingClientRect){
				var box = el.getBoundingClientRect();
				add(box.left + Math.max(de.scrollLeft, db.scrollLeft) - de.clientLeft,
					box.top + Math.max(de.scrollTop, db.scrollTop) - de.clientTop
					);
			} else {
				var op = el.offsetParent,
					fixed = el.style.position == 'fixed', oc = el,
					parent = el.parentNode;
				add(el.offsetLeft, el.offsetTop);
				while (op){
					add(op.offsetLeft, op.offsetTop);

					if(ds.isFF && !/^t(able|d|h)$/i.test(op.tagName)){
						add(el.style.borderLeftWidth, el.style.borderTopWidth);
					}
					if(!fixed && op.style.position == 'fixed')
						fixed = true;
					oc = op.tagName.toLowerCase() == 'body' ? oc : op;
					op = op.offsetParent;
				}
				while (parent && parent.tagName && !/^body|html$/i.test(parent.tagName) ) {
						if (!/^inline|table.*$/i.test(parent.style.display))
							add(-parent.scrollLeft, -parent.scrollTop);
						if (ds.isFF && parent.style.overflow != 'visible')
							add(parent.style.borderLeftWidth, parent.style.borderTopWidth);
						parent = parent.parentNode;
					}
					if (ds.isFF && oc.style.position != 'absolute')
							add(-db.offsetLeft, -db.offsetTop);
					if ( fixed )
						add(Math.max(de.scrollLeft, db.scrollLeft), Math.max(de.scrollTop,  db.scrollTop));
			}
		};
        return {left: left, top: top};
	},
	//DOM操作
	parent:function(){
		return this[0].parentNode;
	},
	remove:function(){
		var o=this[0];
		o.parentNode.removeChild(o);
		return this;
	},
	append:function(){
		var args=arguments;
		var o=this[0];
		for(var i=0; i<args.length; i++){
			if(typeof args[i]=="object" && args[i].nodeType){
				o.appendChild(args[i]);
			}
		}
		return this;
	},
	//常用事件
	bind:function(n,fn){
		ds.event.on(this[0],n,fn);
		return this;
	},
	ubind:function(n,fn){
		ds.event.un(this[0],n,fn);
		return this;
	},
	click:function(fn){
		ds.event.on(this[0],'click',fn);
		return this;
	},
	dblclick:function(fn){
		ds.event.on(this[0],'dblclick',fn);
		return this;
	},
	load:function(fn){
		ds.event.on(this[0],'load',fn);
		return this;
	},
	change:function(fn){
		ds.event.on(this[0],'change',fn);
		return this;
	},
	focus:function(){
		this[0].focus();
		return this;
	}
	
	
	
}
ds.fn.init.prototype=ds.fn;

//AJAX
ds.AJAX=function(){
	return ds.AJAX.fn.init();
}
ds.AJAX.fn=ds.AJAX.prototype={
	init:function(){
		if(!ds.AJAX.xhr){
			var fns=[
					 function(){return new XMLHttpRequest();},
					 function(){return new ActiveXObject('Msxml2.XMLHTTP');},
					 function(){return new ActiveXObject('Microsoft.XMLHTTP');}];
			for(var i=0; i<fns.length; i++){
				try{
					ds.AJAX.xhr=fns[i]();
				}catch(e){}
			}
		}
		if(!ds.AJAX.xhr) alert('XHR对象创建失败！');
		this[0]=this.xhr=ds.AJAX.xhr;
		return this;
	},
	items:[],
	isfire:function(){
		return this.items.length<1;
	},
	ajax:function(url,callback,data,asyn){ //仿列队操作
		if(this.isfire())
			this._ajax(url,callback,data,asyn);
		this.items.push([url,callback,data,asyn]); //加入列队
	},
	_ajax:function(url,callback,data,asyn){
		asyn = (asyn === undefined)? true: asyn;
		var b=typeof data!="undefined"; //是否POST发送
		var o=this,x=this[0];
		var t=url.indexOf('?')!=-1?'&':'?';
		url+=t+'t='+(new Date()).getTime();
		x.open(b?'POST':'GET',url,asyn);
		if(asyn) x.onreadystatechange=function(){ o.change(callback);}
		if(b){
			x.setRequestHeader('Content-Length',data.length);
			x.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		}
		x.send(b?data:null);
		return this;
	},
	get:function(url,callback,asyn){
		this.ajax(url,callback,asyn);
		return this;
	},
	post:function(url,data,callback,asyn){
		this.ajax(url,callback,data,asyn);
		return this;
	},
	change:function(callback){
		var x=this[0];
		if(x.readyState==4){
			if(x.status==200){
				callback(x.responseText,x);
				this.items.shift(); //移出列队
				if(!this.isfire()){
					var it=this.items[0];
					this._ajax(it[0],it[1],it[2],it[3]); //执行下一组
				}
			}else
				this.err(callback);
		}
	},
	err:function(callback){
		alert('ERR MSG:\N' + this[0].statusText + '\n---' + callback);
	}
}
//ds.AJAX.fn.init.prototype=ds.AJAX.prototype;



//Cookie操作
ds.cookie=function(n,vl,ex){
	if(!n){
		if(vl){
			var d=new Date();
			if(ex) d.setTime(d.getTime() + (ex*60*60*1000));
			ds.setCookie(n,vl,ex);
		}else{
			return ds.getCookie(n);
		}
	}
}
ds.getCookie=window.getCookie=function(n){
	var txts=document.cookie.split('; ');
	for(var i=0; i<txts.length; i++){
		if(txts[i].split('=')[0]==n) return unescape(txts[i].split('=')[1]);
	}
	return "";
}
//设置cookie ，ex-时间，单位：小时
ds.setCookie=function(n,vl,ex){
	var c=n+'='+escape(vl) + ';path=/';
	var d=new Date();
	if(ex) d.setTime(d.getTime() + (ex*60*60*1000));
	document.cookie=c+';expries='+d.toGMTString();
}
ds.delCookie=function(n){
	ds.setCookie(n,'',0);
}

//扩展一些实用的
/*Object.prototype.each=function(callback){
	var i=0;
	for(var key in this){
		callback(this[key],key,i);
		i++;
	}
}*/
String.prototype.trim=function(){
	var s=this.replace(/^\s\s*/,'');
	var i=s.length;
	while(/\s/.test(s.charAt(--i)));
	return s.substring(0,i+1);
}
String.prototype.removeHTML=function(){
	return this.replace(/<\/?[^>]+>/gi, '');
}
Array.prototype.indexOf = function(v){ for(var i = this.length; i-- && this[i] !== v;); return i;} 
//end
})();