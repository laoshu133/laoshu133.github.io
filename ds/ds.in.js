﻿/*
author : laoshu133
create : 2011.09.07
update : 2011.11.25
http://www.laoshu133.com
*/
;(function(window, undefined){
	var ds = window.ds || (window.ds = {});
	ds.noop = function(){};
	ds.mix = function(target, source, cover){
		if(typeof source !== 'object'){
			cover = source;
			source = target;
			target = this;
		}
		for(var k in source){
			if(cover || target[k] === undefined){
				target[k] = source[k];
			}
		}
	};

	//AJAX
	var 
	_ajaxDefOps = {
		url : '/',
		type : 'GET',
		data : null,
		callback : function(){},
		error : function(){},
		cache : false,
		asyn : true
	};
	ds.mix({
		getXhr : function(){
			var 
			xhr = null,
			xhrs = [
				function () {return new XMLHttpRequest();},
				function () {return new ActiveXObject('Msxml2.XMLHTTP');},
				function () {return new ActiveXObject('Microsoft.XMLHTTP');}
			];
			for(var i=0,len=xhrs.length; i<len; i++){
				try{
					xhr = xhrs[i]();
					this.getXhr = xhrs[i];
					break;
				}
				catch(_){}
			}
			return xhr;
		},
		buildData : function(data){
			var str = '', dataArr = [];
			if(typeof data === 'object'){
				this.each(data, function(name, val){
					dataArr.push(encodeURIComponent(name) + '=' + encodeURIComponent(val));
				});
				str = dataArr.join('&');
			}
			else{
				str = data + '';
			}
			return str;
		},
		buildUrl : function(url, data, cache){
			//只处理非POST请求，POST请求不缓存
			data = typeof data === 'string' ? data : '';
			var tMark = data.indexOf('&')>-1 ? '&' : '';
			//防止用户快速重复提交
			tMark += !cache ? 't_mark=' + ((new Date()).getTime()/3600).toFixed(0) : '';
			url += data !== '' || tMark !== '' ? (url.indexOf('&')>-1 ? '&' : '?') : '';
			return url + data + tMark;
		},
		ajax : function(ops){
			var 
			xhr = this.getXhr(),
			data = ops.data,
			hasData = !!data,
			isPost;
			this.mix(ops, _ajaxDefOps);
			isPost = ops.type.toUpperCase() === 'POST';
			if(hasData){
				data = this.buildData(data);
			}
			if(!isPost){
				ops.url = this.buildUrl(ops.url, data, ops.cache);
			}
			xhr.open(ops.type, ops.url, ops.asyn);
			isPost && xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			//xhr.setRequestHeader('Content-Length', data.length);
			xhr.onreadystatechange = function(){
				var state;
				if(xhr.readyState === 4){
					state =  xhr.status;
					if(state >= 200 && state<300){
						ops.callback.call(this, xhr.responseText);
					}
					else{
						ops.error.call(this, state);
					}
				}
			}
			xhr.send(data);
			return this;
		},
		get : function(url, callback, cache){
			return this.ajax({
				url : url,
				type : 'GET',
				callback : callback,
				error : function(status){},
				cache : cache
			});
		},
		post : function(url, data, callback){
			return this.ajax({
				url : url,
				type : 'POST',
				data : data,
				callback : callback,
				error : function(status){}
			});
		}
	});
	
	//loader 
	var 
	doc = document,
	w3c = !!doc.dispatchEvent,
	rword = /[^, \|]+/g,
	rloaded = /loaded|complete|undefined/,
	createEl = function(tag){ return doc.createElement(tag);};
	ds.mix({
		$D : function(tag, context){ return (context || doc).getElementsByTagName(tag);},
		loadScript : function(urls, callback){
			var 
			el,
			i = 0,
			len = (urls || '').length,
			loadCount = 0,
			head = doc.head || this.$D('head')[0],
			type = w3c ? 'load' : 'readystatechange',
			handler = function(e){
				var isErr = e && e.type === 'error';
				if(w3c || rloaded.test(this.readyState) || isErr){
					loadCount++;
				}
				if(loadCount >= len){
					(callback || ds.noop).call(this);
				}
				if(isErr){
					this.onerror = this['on' + type] = null;
					head.removeChild(this);
				}
			};
			if(typeof urls === 'string'){
				urls = urls.split(',');
				len = urls.length;
			}
			for(; i<len; i++){
				el = createEl('script');
				el.type = 'text/javascript';
				el.charset = 'utf-8';
				el.async = true;
				el.onerror = el['on' + type] = handler;
				el.src = urls[i];
				head.appendChild(el);
			}
			return this;
		},
		loadStyle : function(url, callback){
			var 
			head = doc.head || this.$D('head')[0],
			el = createEl('style');
			el.type = 'text/css';
			return this.get(url, function(str){
				if(el.styleSheet){
					el.styleSheet.cssText = str;
				}
				else{
					el.innerHTML = str;
				}
				head.appendChild(el);
				(callback || ds.noop).call(el);
			}, true);
		}
	});
	
	//加载依赖组件
	/*(function(){
		var scripts = ds.$D('script'),
		self = scripts[scripts.length - 1],
		urls = self.getAttribute('urls') || self.urls;
		if(urls && urls.length > 0 && (urls = urls.match(rword))){
			ds.loadScript(urls);
		}
	})();*/
})(window);