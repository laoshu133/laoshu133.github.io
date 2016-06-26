/*
author : laoshu133
create : 2011.05.20
update : 2011.08.22
www.laoshu133.com
2011.08.08 --添加 animate模块
2011.08.16 --重整结构
2011.08.27 --完成添加mouseenter，mouseleave自定义事件
2011.08.28 --完善animate模块
2011.08.30 --重写BOM模块，实测IE,FF,CHROME
*/
;(function(window, undefined){
	var 
	doc = window.document,
	//全局id
	_guid = 0,
	guid = function(){ return _guid++},
	//w3c
	w3c = !!doc.addEventListener,
	//特性支持
	support = (function(){
		var div = doc.createElement('div'), a, support;
		div.innerHTML = '<a href="#" style="float:left;opacity:.55;">a</a>';
		a = div.getElementsByTagName('a')[0];
		support = {
			deleteProp : true,
			props : {
				"className" : true
			},
			opacity : /^0.55$/.test(a.style.opacity),
			cssFloat : a.style.cssFloat === 'left',
			cssTransition : false
		};
		try{ delete a.test;}
		catch(_){ support.deleteProp = false;};
		div.innerHTML = '';
		div = null;
		return support;
	})();
	
	//初始化ds
	ds = window.ds = {
		version : 0.3,
		noop : function(){},
		each : function(obj, fn){
			var k,len, i = 0;
			if(typeof fn !== 'function'){
				fn = obj;
				obj = this;
			}
			len = obj.length;
			fn = fn || this.noop;
			if(len){
				for(; i<len;){
					if(fn.call(obj[i], i, obj[i++]) === false) break;
				}
			}
			else{
				for(k in obj){
					if(fn.call(obj[k], k, obj[k]) === false) break;
				}
			}
			return this;
		},
		mix : function(obj, overObj, over){
			if(typeof overObj !== 'object'){
				over = overObj;
				overObj = obj;
				obj = this;
			}
			overObj = overObj || {};
			for(var k in overObj){
				if(!!over || obj[k] === void 0){
					obj[k] = overObj[k];
				}
			}
			return obj;
		},
		extend : function(overObj){
			return this.mix(this, overObj, true);
		},
		support : support
	};
	
	//type, object, string
	var
	rword = /[^, \|]+/g,
	rfirstWord = /^\w/,
	upperFirst = function(str){ return String(str).replace(rfirstWord, function(a){ return a.toUpperCase()});},
	class2type = {
		'[object HTMLDocument]' : 'document',
		'[object HTMLCollection]' : 'nodelist',
		'[object StaticNodeList]' : 'nodelist',
		'[object DOMWindow]' : 'window'
	},
	toString = class2type.toString,
	getType = function(obj, type){
		var _type;
		_type = obj == null ? String(obj) : class2type[toString.call(obj)] || obj.nodeName || '#';
		if(_type.charAt(0) === '#'){
			if(obj == obj.window){
				_type = 'window';
			}
			else if(obj.nodeType === 9){
				_type = 'document';
			}
			else{
				_type = toString.call(obj).slice(8, -1);
			}
		}
		return type ? _type === type : _type;
	};
	('Array,Arguments,Boolean,Date,Document,Function,NodeList,Number,RegExp,String,Window,XMLHttpRequest').replace(rword, function(name){class2type['[object ' + name + ']'] = name.toLowerCase();});
	ds.extend({
		type : getType,
		isEmptyObject : function(obj){
			for(var undf in obj) return false;
			return true;
		},
		isArray : function(obj){
			return getType(obj, 'array');
		},
		isFunction : function(obj){
			return getType(obj, 'function');
		},
		trim : function(str){
			return str.replace(/^\s*/, '').replace(/\s*$/, '');
		},
		upperFirst : upperFirst
	});
	
	//Data
	var 
	_expando = ('@ds_data_' + new Date().getTime()).slice(17),
	cache = {};
	ds.extend({
		cache : cache,
		data : function(el, name, val){
			var id, undef;
			if(typeof el === 'string'){
				if(name !== undef) cache[el] = name;
				return cache[el];
			}
			if((id = el[_expando]) === undef){
				el[_expando] = id = guid();
			}
			if(name === undef){
				return cache[id];
			}
			if(!cache[id]) cache[id] = {};
			if(val !== undef){
				cache[id][name] = val;
			}
			return cache[id][name];
		},
		removeData : function(el, name){
			var id, undef;
			if(typeof el === 'string'){
				delete cache[el];
				return this;
			}
			if((id = el[_expando]) !== undef && cache[id]){
				if(name !== undef){
					delete cache[id][name];
					if(this.isEmptyObject(cache[id])){
						delete cache[id];
					}
				}
				else{
					delete cache[id];
					if(support.deleteProp){
						delete el[_expando];
					}
					else{
						el.removeAttribute(_expando);
					}
				}
			}
			return this;
		},
		clearData : function(elems, clearEvt){
			clearEvt = clearEvt !== false;
			if(elems && elems.nodeType === 1){
				elems = [elems];
			}
			if(elems && elems.length){
				for(var i=0, len=elems.length; i<len; i++){
					if(clearEvt){
						this.unbind(elems[i]);
					}
					this.removeData(elems[i]);
				}
			}
			return this;
		}
	});
	
	//Event
	ds.extend({
		event : {
			fix : function(e){
				e = e || window.event;
				if(e.target) return e;
				
				//拷贝， 不要直接写event for best
				var newE = {}, tar = e.srcElement;
				for(var k in e){
					newE[k] = e[k];
				}
				//fix IE
				newE.preventDefault = function(){
					e.returnValue = false;
				}
				newE.stopPropagation = function(){
					e.cancelBubble = true;
				}
				tar = tar && tar.nodeType === 3 ? tar.parentNode : tar;
				newE.target = tar || doc;
				newE.relatedTarget = e.target !== e.fromElement ? e.toElement : e.fromElement;
				//newE.which = e.keyCode;
				return newE;
			},
			add : w3c ? function(el, type, fn){
				el.addEventListener(type, fn, false);
				return el;
			} : function(el, type, fn){
				el.attachEvent('on' + type, fn);
				return el;
			},
			remove : w3c ? function(el, type, fn){
				el.removeEventListener(type, fn, false);
				return el;
			} : function(el, type, fn){
				el.detachEvent('on' + type, fn);
				return el;
			},
			handler : function(data){
				var event = this, noop = ds.noop;
				return function(){
					var el = data.elem,
					fns = data.callbacks,
					args = arguments,
					e = args[0] = event.fix(args[0]),
					ret;
					for(var i=0, len=fns.length; i<len; i++){
						ret = (fns[i] || noop).apply(el, args);
					}
					if(!event.bubbles){
						e.stopPropagation();
						e.preventDefault();
					}
					return event.bubbles ? ret : false;
				}
			},
			trigger : function(el, type){
				var e;
				if(el.dispatchEvent){
					e = doc.createEvent('Event');
					e.initEvent(type, true, true);
					el.dispatchEvent(e);
				}
				else if(el.fireEvent){
					e = doc.createEventObject();
					el.fireEvent('on' + type, e);
				}
				return el;
			},
			special : {},
			bubbles : true
		},
		bind : function(el, type, fn){
			var event = this.event,
			special = event.special[type],
			cache = this.data(el, '@ds_events') || this.data(el, '@ds_events', {}),
			data = cache[type] || (cache[type] = {}),
			callbacks = data.callbacks || (data.callbacks = []);
			callbacks.push(fn);
			if(!data.handler){
				data.elem = el;
				data.handler = event.handler(data);
				if(!special || special.setup.call(el, data.handler) === false){
					event.add(el, type, data.handler);
				}
			}
			return this;
		},
		unbind : function(el, type, fn){
			var i,
			data, callbacks,
			event = this.event,
			special = event.special[type],
			cache = this.data(el, '@ds_events');
			if(!type){
				return this.each(cache, function(type){
					ds.unbind(el, type);
				});
			}
			if((data = cache[type])){
				callbacks = data.callbacks;
				if(typeof fn === 'function'){
					for(i = callbacks.length-1; i>=0; i--){
						if(fn === callbacks[i]){
							callbacks.splice(i, 1);
						}
					}
				}
				else{
					data.callbacks = [];
				}
				if(data.callbacks.length === 0){
					if(!special || special.unload.call(el) === false){
						event.remove(el, type, data.handler);
						delete cache[type];
						if(this.isEmptyObject(cache)) this.removeData(el, '@ds_events');
					}
				}
			}
			return this;
		},
		trigger : function(el, type, args){
			var event = this.event,
			data, cache, bubble, parent;
			if(!event.special[type]){
				event.trigger(el, type);
			}
			else{
				parent = el.parentNode || el.ownerDocument;
				args = args || [];
				if(!args[0] || !args[0].target){
					args.unshift({
						type : type,
						target : el,
						stopPropagation : this.noop,
						preventDefault : this.noop
					});
				}
				cache = this.data(el, '@ds_events');
				data = cache && cache[type];
				bubble = event.handler(data)(args) !== false;
			}
			if(parent && bubble && event.bubbles){
				this.trigger(parent, type, args);
			}
		}
	});
	
	//DOM
	//elems
	var 
	docEl = doc.documentElement,
	$d = function(id){return "string" == typeof id ? doc.getElementById(id) : id;},
	//attr, prop
	propFix = {
		"class" : "className"
	},
	attrFix = {
		"class" : "className",
		"for" : "htmlFor"
	},
	//css, style
	rcssName = /-(\w)/g,
	rcssDigit = /fontWeight|lineHeight|opacity|zIndex|zoom/i,
	ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity=([^)]*)/i,
	cssFix = {
		"float" : support.cssFloat ? "cssFloat" : 'styleFloat'
	},
	cssHooks = (function(){
		var hooks = {};
		if(!support.opacity){
			hooks.opacity = {
				get : function(el){
					if(ropacity.test(el.currentStyle ? el.currentStyle.filter : el.style.filter)){
						return (parseFloat(RegExp.$1) / 100) + '';
					}
					return '1';
				},
				set : function(el, val){
					var style = el.style, currStyle = el.currentStyle,
					opacity = isFinite(val) ? 'alpha(opacity=' + (val * 100) + ')' : '',
					filter = currStyle && currStyle.filter || style.filter || '';
					style.zoom = 1;
					style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : filter + ' ' + opacity;
				}
			}
		}
		return hooks;
	})(),
	_currCss = function(el, name){
		if(name in cssHooks && cssHooks[name].get){
			return cssHooks[name].get(el);
		}
		return el.currentStyle ? el.currentStyle[name] : doc.defaultView.getComputedStyle(el, null)[name];
	},
	//offset, WH, display
	cssWidth = ['Left', 'Right'], cssHeight = ['Top', 'Bottom'],
	cssDisplay = {},
	defaultDisplay = function(nodeName){
		var el, display, body = doc.body;
		if(!cssDisplay[nodeName]){
			el = doc.createElement(nodeName);
			body && body.appendChild(el);
			display = _currCss(el, 'display');
			el.parentNode && el.parentNode.removeChild(el);
			cssDisplay[nodeName] = display;
		}
		return cssDisplay[nodeName];
	},
	getWH = function(el, leftPad){
		var w = el.offsetWidth, h = el.offsetHeight;
		if(leftPad){
			for(var i=0; i<cssWidth.length; i++){
				w -= parseFloat(css(el, 'padding' + cssWidth[i]));
				h -= parseFloat(css(el, 'padding' + cssHeight[i]));
			}
			
		}
		return {width:w, height:h};
	};
	ds.extend({
		//elems
		$d : $d,
		$D : function(tag, context){ return (context || doc).getElementsByTagName(tag);},
		nodeName : function(el){ return (el!==null ? el.nodeName : String(el)).toUpperCase();},
		createEl : function(name, ops){
			var el = doc.createElement(name);
			this.attr(el, ops);
			return el;
		},
		removeEl : function(el){
			this.removeData(ds.$D('*', el)).removeData(el);
			el.parentNode && el.parentNode.removeChild(el);
			return this;
		},
		//prop
		prop : function(el, name, val){
			var isGet = val === undefined;
			name = propFix[name] || name;
			if(typeof name === 'object'){
				for(var k in name){
					this.prop(el, k, name[k]);
				}
			}
			else{
				if(isGet){
					return el[name];
				}
				else{
					el[name] = val;
				}
			}
			return this;
		},
		//attr
		attr : function(el, name, val){
			var isGet = val === undefined;
			if(typeof name === 'object'){
				for(var k in name){
					this.attr(el, k, name[k]);
				}
			}
			else{
				name = attrFix[name] || name;
				if(name in support.props || !('setAttribute' in el)){
					return this.prop(el, name, val);
				}
				if(isGet){
					return el.getAttribute(name);
				}
				else{
					el.setAttribute(name, "" + val);
				}
			}
			return this;
		},
		//css, style
		css : function(el, name, val){
			var isSet = val !== undefined;
			if(typeof name === 'object'){
				for(var k in name){
					this.css(el, k, name[k]);
				}
			}
			else{
				name = cssFix[name] || name;
				name = name.replace(rcssName, function(all, letter){ return letter.toUpperCase();});
				if(isSet){
					if(typeof val === 'number' && !rcssDigit.test(name)){
						val = (parseFloat(val) || 0) + 'px';
					}
					if(name in cssHooks && cssHooks[name].set){
						cssHooks[name].set(el, val);
					}
					else{
						el.style[name] = val;
					}
				}
				else{
					return _currCss(el, name);
				}
			}
			return this;
		},
		//innerHTML
		html : function(el, val){
			if(val === undefined){
				return el.innerHTML;
			}
			this.removeData(this.$D('*', el));
			el.innerHTML = val;
		},
		//offset, WH, display
		hide : function(el){
			el.style.display = 'none';
			return this;
		},
		show : function(el){
			var display, style = el.style;
			if(style){
				if(style.display === 'none'){
					display = style.display = '';
				}
			}
			if(display === '' && _currCss(el, 'display') === 'none'){
				style.display = defaultDisplay(el.nodeName);
			}
			return this;
		},
		contains : docEl.contains ? function(elA, elB){
			return (elA !== elB && elA.contains(elB));
		} : function(elA, elB){
			return !!(elA && elB && elA.compareDocumentPosition(elB) & 16);
		},
		pageScrollTop : function(){
			return window.pageYOffset || docEl.scrollTop || doc.body.scrollTop;
		},
		scrollTop : function(el, val){
			if(!isNaN(val)){
				el.scrollTop = val;
			}
			else{
				return el.scrollTop;
			}
		},
		getPosition : function(el){
			var 
			leftPad = _currCss(el, 'marginLeft'), topPad = _currCss(el, 'marginTop'),
			left = el.offsetLeft, top = el.offsetTop;
			leftPad = parseFloat(leftPad) || 0;
			topPad = parseFloat(topPad) || 0;
			return {left : left-leftPad, top : top-topPad};
		},
		getWH : getWH,
		getOuterWH : function(el, padMargin){
			var wh = getWH(el), w = wh.width, h = wh.height;
			for(var i=0;i<cssWidth.length; i++){
				w += padMargin ? parseFloat(css(el, 'margin' + cssWidth[i])) : 0;
				h += padMargin ? parseFloat(css(el, 'margin' + cssHeight[i])) : 0;
			}
			return {width:w, height:h};
		},
		getOffset : function(el){
			if(el.getBoundingClientRect){
				return el.getBoundingClientRect();
			}
			var left = el.offsetLeft, top = el.offsetTop;
			while(el = el.offsetParent && /(?:body|html)/i.test(el.nodeName)){
				left += el.offsetLeft;
				top += el.offsetTop;
			}
			return { left:left, top:top};
		},
		getPageSize : function(){
			var docEl = doc.documentElement, docBd = doc.body, Max = Math.max,
			wStr = ['scrollWidth', 'offsetWidth', 'clientWidth'], hStr = ['scrollHeight', 'offsetHeight', 'clientHeight'], w , h;
			w = Max(Max(docEl[wStr[0]], docBd[wStr[0]]), Max(docEl[wStr[1]], docBd[wStr[1]]), Max(docEl[wStr[2]], docBd[wStr[2]]));
			h = Max(Max(docEl[hStr[0]], docBd[hStr[0]]), Max(docEl[hStr[1]], docBd[hStr[1]]), Max(docEl[hStr[2]], docBd[hStr[2]]));
			return {height:h, width:w};
		},
		getWindowSize : function(){
			var docEl = doc.documentElement, docBd = doc.body, Max = Math.max,
			wStr = 'Width', hStr = 'Height', priStr = ['inner', 'client'], supportInner = !!window.innerWidth, w, h;
			w = supportInner ? window[priStr[0] + wStr] : Max(docEl[priStr[1] + wStr], docBd[priStr[1] + wStr]);
			h = supportInner ? window[priStr[0] + hStr] : Max(docEl[priStr[1] + hStr], docBd[priStr[1] + hStr]);
			return {height:h, width:w};
		}
		
	});
	
	//BOM
	ds.extend((function(names){
		var brows = {};
		names.replace(rword, function(name){ brows[name] = 0;});
		if(new RegExp('(' + names + ')[ \\/](\\d+)\\.').test(navigator.userAgent)){
			brows[RegExp.$1] = parseInt(RegExp.$2, 10);
		}
		return {
			browser : brows,
			ieVer : function(ver){
				var _ver = this.browser.IE;
				return isNaN(ver) ? _ver : _ver == ver;
			}
		};
	})('Chrome|Firefox|IE|Opera|Safari'));
	
	//AJAX
	var getXhr = function(){
		var fns = [
			function () {return new XMLHttpRequest();},
			function () {return new ActiveXObject('Msxml2.XMLHTTP');},
			function () {return new ActiveXObject('Microsoft.XMLHTTP');}
		];
		for(var i = 0, len = 3; i<len; i++){
			try{
				getXhr = fns[i];
				getXhr();
				break;
			}
			catch(_){}
		}
		if(i >= len){ /*throw 'XHR 创建失败';*/ return null;}
		return getXhr();
	},
	_ajaxDefOps = {
		url : '',
		type : 'GET',
		data : null,
		callback : function(){},
		error : function(){},
		cache : false,
		asyn : true
	};
	ds.extend({
		getXhr : getXhr,
		buildData : function(data){
			var str = '', dataArr = [];
			if(typeof data === 'object'){
				this.each(data, function(name, val){
					dataArr.push(name + '=' + val);
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
			xhr = getXhr(),
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
				error : function(status){ ds.debug('XHR ERROR - ' + status);},
				cache : cache
			});
		},
		post : function(url, data, callback){
			return this.ajax({
				url : url,
				type : 'POST',
				data : data,
				callback : callback,
				error : function(status){ ds.debug('XHR ERROR - ' + status);}
			});
		}
	});
	
	//loader 
	var basePath = 'js';
	ds.extend({
		loadScript : function(url, fn){
			var 
			head = doc.head || this.$D('head')[0],
			type = w3c ? 'load' : 'readystatechange',
			rstatus = /loaded|complete|undefined/,
			el = this.createEl('script', {'type':'text/javascript', 'src':url});
			this.bind(el, type, function(){
				var status = el.readyState;
				if(w3c || rstatus.test(status)){
					ds.isFunction(fn) && fn.call(el);
					ds.removeEl(el);
				}
			});
			head.appendChild(el);
			//head.insertBefore(el, head.firstChild);
			return this;
		},
		loadStyle : function(url, fn){
			var el = createEl('style', {type:'text/css'}), head = $D('head')[0];
			ds.get(url, function(str){
				if(el.styleSheet){
					el.styleSheet.cssText = str;
				}
				else{
					el.innerHTML = str;
				}
				head.appendChild(el);
				typeof fn === 'function' && fn.call(el);
			}, true);
			return el;
		},
		use : function(name, fn){
			return this.loadScript(basePath + '/' + name + '.js', fn);
		}
	});
	
	//ready
	ds.extend({
		//DOM ready
		ready : (function(){
			var 
			handler, callbacks = [],
			bound = false, isReady = false,
			domType = 'DOMContentLoaded', ieType = 'onreadystatechange',
			docEl = doc.documentElement,
			fire = function(){
				if(!doc.body){
					return setTimeout(fire, 16);
				}
				if(!isReady){
					for(var i=0,len=callbacks.length; i<len; i++){
						callbacks[i].call(doc);
					}
					callbacks = [];
				}
				isReady = true;
			},
			checkScroll = function(){
				try{ docEl.doScroll('left');}
				catch(_){return setTimeout(checkScroll, 32);}
				fire();
			},
			bind = function(fn){
				if(typeof fn === 'function') callbacks.push(fn);
				if(!bound){
					var notFrame = false;
					if(w3c){
						doc.addEventListener(domType, handler, false);
						window.addEventListener('load', handler, false);
					}
					else{
						doc.attachEvent(ieType, handler);
						window.attachEvent('load', handler);
						//IE hack ，文档未加载完成时， 没有doScroll
						try{ notFrame = window.frameElement == null;}catch(_){}
						if(docEl && notFrame){
							checkScroll();
						}
					}
					bound = true;
				}
			};
			handler = w3c ? function(){
				doc.removeEventListener(domType, handler, false);
				window.removeEventListener('load', handler, false);
				fire();
			} : function(){
				doc.detachEvent(ieType, handler);
				window.detachEvent('load', handler);
				fire();
			}
			return function(fn){
				if(isReady){
					fn.call(doc);
				}
				else bind(fn);
				return this;
			}
		})()
	});
	
	//animate
	var 
	fxEase = function(t){return (t*=2)<1?.5*t*t:.5*(1-(--t)*(t-2));},
	cssPris = ['webkit', 'Moz', 'O', ''],
	trainsitionPri = (function(){
		for(var i=0, len=cssPris.length; i<len; i++){
			if((cssPris[i] + 'TransitionDuration') in docEl.style){
				support.cssTransition = true;
				return cssPris[i];
			}
		}
		return '';
	})();
	ds.extend({
		animate : support.cssTransition ? function(el, fxOps, duration, callback, ease){
			var 
			self = this,
			durStr = 'TransitionDuration',
			easeStr = 'TransitionTimingFunction',
			type = 'TransitionEnd',
			fixType = trainsitionPri + type,
			tranOps = {},
			oldDur = this.css(el, trainsitionPri + durStr),
			fxDone = function(e){
				self.css(el, trainsitionPri + durStr, oldDur);
				(callback || self.noop).call(el, e);
				self.unbind(el, fixType, fxDone)
				.unbind(el, type.toLowerCase(), fxDone)
				.removeData(el, '@ds_fx_ops');
			};
			fxOps = fxOps || {};
			duration = isFinite(duration) ? duration + 'ms' : (duration || '400ms');
			tranOps[trainsitionPri + durStr] = duration;
			tranOps[trainsitionPri + easeStr] = ease;
			this.bind(el, fixType, fxDone).bind(el, type.toLowerCase(), fxDone)
			.data(el, '@ds_fx_ops', fxOps);
			return this.css(el, tranOps).css(el, fxOps);
		} : function(el, fxOps, duration, callback, ease){
			if(this.isEmptyObject(fxOps)) return this;
			var k, tmp, self = this,
			oldOps = {}, opsRange = {}, oneSetOps = {};
			for(k in fxOps){
				tmp = parseFloat(fxOps[k]);
				oldOps[k] = parseFloat(this.css(el, k));
				if(isFinite(tmp)){
					opsRange[k] = tmp - oldOps[k];
				}
				else{
					oneSetOps[k] = fxOps[k];
				}
			}
			//动画准备
			duration = isFinite(duration) ? parseFloat(duration) : 400;
			//动画算法
			ease = this.isFunction(ease) ? ease : fxEase;
			var _t,
			abs = Math.abs,
			fxDone = function(){
				(callback || self.noop).call(el, {type:'transitionend', target:el});
				self.removeData(el, '@ds_fx_ops');
			},
			fxData = {
				timer : _t,
				fxOps : fxOps,
				fxDone : fxDone
			},
			sTime = new Date().getTime(),
			fx = function(){
				var tMap = new Date().getTime() - sTime;
				if(tMap >= duration){
					self.css(el, fxOps)
					return fxDone();
				}
				for(var k in opsRange){
					self.css(el, k, oldOps[k] + opsRange[k] * ease(tMap/duration));
				}
				fxData.timer = _t = setTimeout(fx, 16);
			};
			fx();
			this.data(el, '@ds_fx_ops', fxData);
			//字符串属性只设置一次
			return this.css(el, oneSetOps);
		},
		stop : support.cssTransition ? function(el, toEnd){
			var k, currOps = {}, 
			name = trainsitionPri + 'TransitionDuration',
			fxOps = this.data(el, '@ds_fx_ops');
			if(!fxOps) return this;
			for(k in fxOps) currOps[k] = this.css(el, k);
			this.css(el, name, '0s')
			//FF, Chrome设置TransitionDuration后必须再设置并读取一次才生效, 只能设置当前动画属性才能生效， 读取随便
			.css(el, currOps).css(el, name); 
			this.event.trigger(el, trainsitionPri + 'TransitionEnd');
			return !toEnd ? this : this.css(el, fxOps);
		} : function(el, toEnd){
			var data = this.data(el, '@ds_fx_ops');
			if(!data) return this;
			window.clearTimeout(data.timer);
			data.fxDone();
			return !toEnd ? this : this.css(el, data.fxOps);
		}
	});
	
	//mouseenter, mouseleave
	(function(){
		var 
		event = ds.event,
		isElem = function(el){
			return el && el.nodeType === 1;
		},
		special = event.special,
		support = 'onmouseenter' in docEl;
		if(!support){
			special.mouseenter = {
				setup : function(callback){
					var isOut = true,
					handlers = ds.data(this, '@e_enter', {
						'in' : function(e){
							if(isOut){
								isOut = false;
								callback.call(this, ds.mix({type:'mouseenter'}, e));
							}
						},
						'out' : function(e){
							var tar = e.relatedTarget;
							if(this !== tar && isElem(tar) && !ds.contains(this, tar)){
								isOut = true;
							}
						}
					});
					event.add(this, 'mouseover', handlers['in']);
					event.add(this, 'mouseout', handlers['out']);
					return true;
				},
				unload : function(){
					var handlers = ds.data(this, '@e_enter');
					ds.removeData(this, '@e_enter');
					event.remove(this, 'mouseover', handlers['in']);
					event.remove(this, 'mouseout', handlers['out']);
					return false;
				}
			}
			special.mouseleave = {
				setup : function(callback){
					var handler = ds.data(this, '@e_leave', function(e){
						var tar = e.relatedTarget;
						if(this !== tar && isElem(tar) && !ds.contains(this, tar)){
							callback.call(this, ds.mix({type:'mouseleave'}, e));
						}
					});
					event.add(this, 'mouseout', handler);
				},
				unload : function(){
					var handler = ds.data(this, '@e_leave');
					ds.removeData(this, '@e_leave').event.remove(this, handler);
					return false;
				}
			}
		}
		ds.hover = function(el, enterFn, leaveFn){
			this.bind(el, 'mouseenter', enterFn).bind(el, 'mouseleave', leaveFn);
		}
	})();
	
	//debug
	ds.extend({
		log : function(/*info1, ...infoN, inDiv*/){
			var args = arguments;
			if(!window.console || args[args.length-1] == '@div'){
				var div = this.$d('ds_debug'), p = this.createEl('p'), str = '', sStr = ',&nbsp;';
				if(!div){
					div = this.createEl('div', {id:'ds_debug'});
					div.style.cssText = 'background:#eee;border:1px dashed #aaa;padding:10px;right:0;top:0;position:fixed;width:300px';
					ds.css(div, 'opacity', 0.8);
					doc.body.appendChild(div);
				}
				for(var i=0, len=args.length; i<len; i++){
					str += args[i] + sStr;
				}
				p.style.cssText = 'border-bottom:1px solid #ddd;padding:4px 0;font-size:14px;';
				p.innerHTML = str.slice(0, -sStr.length);
				div.appendChild(p);
			}
			else{
				console.log([].join.call(args, ','));
			}
		}
	});

	
})(window);
