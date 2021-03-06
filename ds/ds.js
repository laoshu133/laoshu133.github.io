/*
author : laoshu133
create : 2011.05.20
update : 2011.08.22
www.laoshu133.com
2011.08.08 --添加 animate模块
2011.08.16 --重整结构
2011.08.27 --完成添加mouseenter，mouseleave自定义事件
2011.08.28 --完善animate模块
2011.08.30 --重写BOM模块，实测IE,FF,CHROME,
2011.08.31 --重新了css模块，原CSS在opera下有点问题，添加class模块
2011.09.02 --完善event模块，支持多事件绑定
2011.09.04 --添加queue模块，完善loader模块，支持串行加载脚本
2011.09.05 --修正type, 使其支持XHR，修正DOM部分代码
2011.09.05 --完善loadScript，添加async属性，理论上支持并行加载 http://www.laoshu133.com/ds/loadScript.html
2011.10.30 --重写AJAX部分
2011.12.16 --重写attr,prop; 修正async属性用prop操作，非attr
2011.12.16 --修正loadScript并行加载不能按顺序执行和重复加载的BUG
2011.12.19 --完善AJAX对JSON的支持
*/
;(function(window, doc, undefined){
	var
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
			boundingRect : !!div.getBoundingClientRect,
			deleteProp : true,
			props : {
				async : true,
				className : true,
				checked : true,
				frameBorder : true,
				innerHTML : true,
				scrollLeft : true,
				scrollTop : true
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
		ds : 0.5,
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
		mix : function(target, source, cover){
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
			return target;
		},
		extend : function(source){
			return this.mix(this, source, true);
		},
		support : support,
		debug : true
	};

	//type, object, string
	var
	rword = /[^, \|]+/g,
	rtrim = /^\s*|\s*$/g,
	rfirstWord = /^\w/,
	rcamel = /-[a-z]/g,
	//字符串去重 http://www.cnblogs.com/rubylouvre/archive/2011/01/27/1946397.html
	rnotRepeat = /(^|\s)(\S+)(?=\s(?:\S+\s)*\2(?:\s|$))/g,
	class2type = {
		'[object HTMLDocument]' : 'document',
		'[object HTMLCollection]' : 'nodelist',
		'[object StaticNodeList]' : 'nodelist',
		'[object DOMWindow]' : 'window'
	},
	toString = class2type.toString,
	getType = function(obj, type){
		var
		_type = obj == null ? String(obj) : class2type[toString.call(obj)] || obj.nodeName || '#';
		if(_type.charAt(0) === '#'){
			if(obj == obj.window){
				_type = 'window';
			}
			else if(obj.nodeType === 9){
				_type = 'document';
			}
			else if('open' in obj && 'send' in obj){
				_type = 'xmlhttprequest';
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
		isArray : Array.isArray || function(obj){
			return getType(obj, 'array');
		},
		isFunction : function(obj){
			return getType(obj, 'function');
		},
		trim : function(str){
			return str.replace(rtrim, '');
		},
		upperFirst : function(str){	return String(str).replace(rfirstWord, function(a){ return a.toUpperCase()});},
		camelCase : function(str){
			return str.replace(rcamel, function(s){ return s.charAt(1).toUpperCase()});
		},
		distinctCase : function(str){
			return str.replace(rnotRepeat, '');
		}
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
			if(typeof type === 'object'){
				return this.each(type, function(type, fn){
					ds.bind(el, type, fn);
				});
			}
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
			if(typeof type === 'object'){
				return this.each(type, function(type, fn){
					ds.unbind(el, type,fn);
				});
			}
			var i, data, callbacks,
			event = this.event,
			special = event.special[type],
			cache = this.data(el, '@ds_events') || {};
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
			return this;
		}
	});

	//DOM
	//elems
	var docEl = doc.documentElement,
	$d = function(id, context){return "string" == typeof id ? (context || doc).getElementById(id) : id};
	ds.extend({
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
		}
	});
	//attr, prop
	var propFix = {
		html : "innerHTML",
		"class" : "className"
	},
	attrFix = {
		"for" : "htmlFor",
		"class" : "className"
	};
	ds.extend({
		attr : function(el, name, val){
			if(val === undefined && typeof name === 'string'){
				return el.getAttribute(name);
			}
			if(typeof name === 'object'){
				return this.each(name, function(name, val){
					ds.attr(el, name, val);
				});
			}
			name = attrFix[name] || name;
			if(name in support.props || !('setAttribute' in el)){
				return this.prop(el, name, val);
			}
			el.setAttribute(name, val);
			return this;
		},
		prop : function(el, name, val){
			if(val === undefined && typeof name === 'string'){
				return el[name];
			}
			if(typeof name === 'object'){
				return this.each(name, function(name, val){
					ds.prop(el, name, val);
				});
			}
			el[name] = val;
			return this;
		}
	});

	//css, style
	var
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
	_currCss = doc.defaultView && window.getComputedStyle ? function(el, name){
		var ret, view = el.ownerDocument.defaultView;
		ret = view ? view.getComputedStyle(el, null)[name] : undefined;
		return ret !== '' ? ret : el.style[name];
	} : function(el, name){
		return el.currentStyle[name];
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
	};
	ds.extend({
		css : function(el, name, val){
			if(typeof name === 'object'){
				for(var k in name){
					this.css(el, k, name[k]);
				}
				return this;
			}
			var ret, hooks = cssHooks[name];
			name = this.camelCase(cssFix[name] || name);
			if(val !== undefined){
				if(typeof val === 'number' && !rcssDigit.test(name)){
					val += 'px';
				}
				if(!hooks || !hooks.set || (val = hooks.set(el, val)) !== undefined){
					el.style[name] = val;
				}
			}
			else{
				if(hooks && 'get' in hooks && (ret = hooks.get(el, name)) !== undefined){
					return ret;
				}
				return _currCss(el, name);
			}
			return this;
		},
		addClass : function(el, names){
			if(names){
				var i = 0,
				cNames = [],
				cName = this.trim(el.className);
				names.replace(rword, function(name){ cNames[i++] = name; });
				if(cName.length){
					cNames.unshift(cName);
				}
				el.className = this.trim(this.distinctCase(cNames.join(' ')));
			}
			return this;
		},
		hasClass : function(el, name){
			return (' ' + el.className + ' ').indexOf(name) > -1;
		},
		removeClass : function(el, name){
			var cName = '';
			if(name){
				cName = (' ' + el.className + ' ').replace(' ' + name + ' ', ' ');
			}
			el.className = this.trim(cName);
			return this;
		},
		toggleClass : function(el, names){
			var clObj = {className : el.className};
			names.replace(rword, function(name){
				ds[ds.hasClass(clObj, name) ? 'removeClass' : 'addClass'](clObj, name);
			});
			el.className = clObj.className;
			return this;
		}
	});

	//display, WH, offset
	var rroot = /body|html/i;
	ds.extend({
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
			var isDoc = el === doc || el === window;
			if(!isFinite(val)){
				return isDoc ? this.pageScrollTop() : el.scrollTop;
			}
			if(isDoc){
				window.scrollTo(window.scrollX || 0, val);
			}
			else{
				el.scrollTop = val;
			}
			return this;
		},
		getPosition : function(el){
			var leftPad = parseFloat(_currCss(el, 'marginLeft')) || 0,
			topPad = parseFloat(_currCss(el, 'marginTop')) || 0;
			return {left : el.offsetLeft - leftPad, top : el.offsetTop - topPad};
		},
		getWH : function(el, leftPad){
			var w = el.offsetWidth, h = el.offsetHeight;
			if(leftPad){
				for(var i=0,len=cssWidth.length; i<len; i++){
					w -= parseFloat(_currCss(el, 'padding' + cssWidth[i]));
					h -= parseFloat(_currCss(el, 'padding' + cssHeight[i]));
				}
			}
			return {width:w, height:h};
		},
		getOuterWH : function(el, padMargin){
			var wh = this.getWH(el);
			if(padMargin){
				for(var i=0,len=cssWidth.length; i<len; i++){
					wh.width += parseFloat(_currCss(el, 'margin', cssWidth[i])) || 0;
					wh.height += parseFloat(_currCss(el, 'margin', cssHeight[i])) || 0;
				}
			}
			return wh;
		},
		getOffset : function(el){
			if(support.boundingRect){
				return el.getBoundingClientRect();
			}
			var left = el.offsetLeft, top = el.offsetTop;
			while((el = el.offsetParent) && !rroot.test(el.nodeName)){
				left += el.offsetLeft;
				top += el.offsetTop;
			}
			return {left:left, top:top};
		},
		getPageSize : function(){
			var Max = Math.max,
			body = doc.body,
			wStr = ['scrollWidth', 'offsetWidth', 'clientWidth'],
			hStr = ['scrollHeight', 'offsetHeight', 'clientHeight'];
			return {
				width : Max(Max(docEl[wStr[0]], body[wStr[0]]), Max(docEl[wStr[1]], body[wStr[1]]), Max(docEl[wStr[2]], body[wStr[2]])),
				height : Max(Max(docEl[hStr[0]], body[hStr[0]]), Max(docEl[hStr[1]], body[hStr[1]]), Max(docEl[hStr[2]], body[hStr[2]]))
			};
		},
		getWindowSize : function(){
			var body = doc.body,
			supportInner = !!window.innerWidth;
			return {
				width : supportInner ? window.innerWidth : Math.max(docEl.clientWidth, body.clientWidth),
				height : supportInner ? window.innerHeight : Math.max(docEl.clientHeight, body.clientHeight)
			};
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
	var
	rpart = /([^&=]*)=([^&$]*)/g,
	_ajaxDefOps = {
		url : '/',
		type : 'GET',
		data : null,
		dataType : 'string',
		cache : false,
		async : true,
		username : undefined,
		password : undefined,
		error : ds.noop,
		success : ds.noop,
		complete : ds.noop
	};
	ds.extend({
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
			var ret;
			if(typeof data !== 'object'){
				ret = {};
				('' + data).replace(rpart, function(a, name, val){ ret[name] = val;	});
			}
			else{
				ret = data;
			}
			return ret;
		},
		serialize : function(data){
			var k, ret = [];
			for(k in this.buildData(data)){
				ret.push(encodeURIComponent(k) + '=' + encodeURIComponent(data[k]));
			}
			return ret.join('&');
		},
		buildUrl : function(url, data, cache){
			//只处理非POST请求，POST请求本身不缓存
			var
			ret = this.buildData(data);
			if(!cache && ret) {
				ret._ = ((new Date()).getTime()/3600).toFixed(0);
			}
			return url + ((ret = this.serialize(ret)).length > 0 ? (url.indexOf('?') > -1 ? '&' : '?') : '') + ret;
		},
		ajax : function(ops){
			ops = this.mix(ops || {}, _ajaxDefOps);
			var
			xhr = this.getXhr(),
			isPost = ops.type.toUpperCase() === 'POST';
			xhr.onreadystatechange = function(){
				var data, status;
				if(xhr.readyState == 4){
					status = xhr.status;
					if(status >= 200 && status < 300 || status == 304){
						data = ops.dataType === 'xml' ? xhr.responseXML : xhr.responseText;
						if(ds.camelCase('get-' + ops.dataType) in ds){
							data = ds[ds.camelCase('get-' + ops.dataType)](data);
						}
						ops.success.call(xhr, data);
					}
					else{
						ops.error.call(xhr, status, xhr.statusText);
					}
					ops.complete.call(xhr, xhr.responseText, status, xhr.statusText);
					delete xhr.onreadystatechange;
				}
			}
			if(!isPost){
				ops.url = this.buildUrl(ops.url, ops.data, ops.cache);
			}
			xhr.open(ops.type, ops.url, ops.async, ops.username, ops.password);
			if(isPost){
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				//xhr.setRequestHeader('Content-Length', this.serialize(ops.data).length);
			}
			xhr.send(isPost ? this.serialize(ops.data) : null);
			return this;
		},
		get : function(url, callback, dataType, cache){
			return this.ajax({
				url : url,
				type : 'GET',
				cache : cache,
				success : callback,
				dataType : dataType
			});
		},
		post : function(url, data, callback, dataType){
			return this.ajax({
				url : url,
				type : 'POST',
				data : data,
				success : callback,
				dataType : dataType
			});
		},
		getJson : function(data){
			if(typeof data === 'object') return data;
			try{ data = !!window.JSON ? JSON.parse(data) : (new Function('return ' + data))();}
			catch(_){ throw "parse error"}
			return data;
		}
	});

	//queue
	ds.extend({
		queue : function(el, name, fn){
			if(!fn){
				fn = name;
				name = 'fx';
			}
			name = '@ds_queue_' + name;
			if(this.isArray(fn)){
				this.data(el, name, fn);
			}
			else{
				var data = this.data(el, name) || this.data(el, name, []);
				data.push(fn);
			}
			return this;
		},
		dequeue : function(el, name){
			if(!name){
				name = 'fx';
			}
			var fn,
			data = this.data(el, '@ds_queue_' + name) || [];
			if(data.length > 0){
				fn = data.shift();
				this.isFunction(fn) && fn.call(el, function(){
					ds.dequeue(el, name);
				});
			}
			return this;
		},
		clearQueue : function(el, name){
			name = '@ds_queue_' + (name || 'fx');
			ds.data(el, name, []);
			return this;
		}
	});

	//loader
	var
	rloaded = /loaded|complete|undefined/;
	ds.extend({
		loadScript : (function(){
			var
			cache = {},
			head = doc.head || ds.$D('head')[0],
			type = w3c ? 'load' : 'readystatechange',
			asyncOdered = (window.opera && Object.prototype.toString.call(window.opera) == "[object Opera]") || (function(){return doc.createElement('script').async === true;})(),
			_defOps = {
				src : '/',
				elem : null,
				async : false,
				charset : 'utf-8',
				type : asyncOdered ? 'text/javascript' : 'text/cache',
				onload : function(){
					ds.log(this.src + ' loaded');
				},
				onerror : ds.noop,
				loaded : false
			},
			onloadQueue = function(queue, callback){
				var i=0, len = queue.length, script;
				for(; i<len; i++){
					script = queue[i];
					if(!script.loaded) return;
					if(!script.execed){
						script.execed = true;
						head.removeChild(script.elem);
						script.elem = ds.createEl('script', {
							src : script.src,
							type : 'text/javascript',
							async : script.async,	//此属性不能用 setAttribute 设置
							charset : script.charset
						});
						head.appendChild(script.elem);
						script.onload.call(script.elem);
						i >= len - 1 && (callback || ds.noop).call(queue);
					}
				}
			},
			handler = function(queue, script, callback, e){
				var elem = script.elem;
				if(w3c || script.loaded || elem && rloaded.test(elem.readyState)){
					queue.loadCount++;
					script.loaded = true;
					elem.onerror = elem['on' + type] = null;
					asyncOdered ? script.onload.call(script.elem) : onloadQueue(queue, callback);
				}
				if(e && e.type === 'error'){
					!w3c && queue.loadCount++;
					script.onerror.call(script);
					head.removeChild(elem);
					script.elem = elem = null;
				}
				asyncOdered && queue.loadCount >= queue.length && (callback || ds.noop).call(queue);
			},
			push = Array.prototype.push,
			addHandler = function(){
				var args = arguments;
				return function(e){
					push.call(args, e || window.event) && handler.apply(null, args);
				}
			};
			return function(queue, callback){
				if(typeof queue === 'string'){
					queue = queue.split(',');
				}
				var script,
				len = queue.length,
				i = queue.loadCount = 0;
				for(; i<len; i++){
					script = cache[typeof queue[i] === 'object' ? queue[i].src : queue[i]];
					if(script && script.loaded){
						handler(queue, script, callback);
						continue;
					}
					script = queue[i] = this.mix(typeof queue[i] === 'object' ? queue[i] : {src:queue[i]}, _defOps);
					script.elem = this.createEl('script', {
						src : script.src,
						type : script.type,
						async : script.async,	//此属性不能用 setAttribute 设置
						charset : script.charset
					});
					script.elem.onerror = script.elem['on' + type] = addHandler(queue, script, callback);
					cache[script.src] = script;
					head.insertBefore(script.elem, head.firstChild);
				}
				return this;
			}
		})(),
		loadStyle : function(url, callback){
			var
			head = doc.head || this.$D('head')[0],
			el = this.createEl('style', {type:'text/css'});
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
	cssPris = ['webkit', 'Moz', 'O', 'ms', ''],
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
			durStr = trainsitionPri + 'TransitionDuration',
			easeStr = trainsitionPri + 'TransitionTimingFunction',
			type = 'TransitionEnd',
			fixType = trainsitionPri + type,
			oldDur = this.css(el, durStr),
			fxDone = function(e){
				self.css(el, durStr, oldDur);
				(callback || self.noop).call(el, e);
				self.unbind(el, fixType, fxDone)
				.unbind(el, type.toLowerCase(), fxDone)
				.removeData(el, '@ds_fx_ops');
			};
			fxOps = fxOps || {};
			duration = isFinite(duration) ? duration + 'ms' : (duration || '400ms');
			this.data(el, '@ds_fx_ops', fxOps);
			this.bind(el, fixType, fxDone).bind(el, type.toLowerCase(), fxDone)
			.css(el, durStr, duration).css(el, easeStr, ease || 'cubic-bezier(0.25, 0.1, 0.25, 1)');
			return this.css(el, fxOps);
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
			if(!ds.debug) return this;
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
				console.log(Array.prototype.join.call(args, ', '));
			}
		}
	});
})(this, this.document);