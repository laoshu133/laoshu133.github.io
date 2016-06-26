/*
author : laoshu133
update : 2011.05.20
www.laoshu133.com
*/
;(function(window, undefined){
	var 
	//私有属性
	guid = 0,
	getGuid = function(){ return guid++;},
	doc = window.document,
	docEl = doc.documentElement,
	$d = function(id){return "string" == typeof id ? document.getElementById(id) : id;},
	$D = function(tag, context){ return (context || doc).getElementsByTagName(tag);},
	addE = doc.addEventListener ? function(el, type, fn){
		el.addEventListener(type, fn, false);
	} : function(el, type, fn){
		var pri = type + '_' + fn;
		fn[pri] = function(){
			fn.call(el, ds.fixEvent(window.event));
		}
		el.attachEvent('on' + type, fn[pri]);
	},
	removeE = doc.removeEventListener ? function(el, type, fn){
		el.removeEventListener(type, fn, false);
	} : function(el, type, fn){
		var pri = type + '_' + fn;
		fn[pri] && el.detachEvent('on' + type, fn[pri]);
	},
	css = function(el, name, val){
		if(typeof name === 'object'){
			for(var k in name){
				css(el, k, name[k]);
			}
		}
		else if(val !== undefined){
			el.style[name] = val;
		}
		else{
			return el.currentStyle ? el.currentStyle[name] : doc.defaultView.getComputedStyle(el, null)[name];
		}
		return el;
	},
	attr = function(el, name, val){
		var isGet = val === undefined,
		cStr = 'className',
		others = {
			'class' : 'className',
			'for' : 'htmlFor'
		};
		name = others[name] ? others[name] : name;
		if(typeof name === 'string'){
			if(name === cStr){
				if(isGet){
					return el[cStr];
				}
				el[cStr] = val;
			}
			else{
				if(isGet){
					return el.getAttribute(name);
				}
				el.setAttribute(name, val);
			}
		}
		else{
			for(var k in name){
				attr(el, k, name[k]);
			}
		}
		return el;
	},
	createEl = function(name, ops){
		var el = doc.createElement(name);
		attr(el, ops);
		return el;
	},
	
	//初始化ds
	extend = function(oldObj, newObj){
		if(typeof newObj !== 'object'){
			newObj = oldObj;
			oldObj = this;
		}
		oldObj = oldObj || {};
		for(var k in newObj){
			oldObj[k] = newObj[k];
		}
	},
	each = function(obj, fn){
		var _noop = function(){}, i = 0;
		if(typeof obj === 'function'){
			fn = obj;
			obj = this;
		}
		fn = fn || _noop;
		for(var k in obj){
			if(fn.call(obj[k], i++, obj[k]) === false) break;
		}
	},
	ds = { extend : extend, each : each, version : 0.1};

	//EXTEND
	var
	upperFirst = function(str){ return String(str).replace(/^\w/, function(a){ return a.toUpperCase()});},
	types = 'array boolean date function number object regexp string'.split(' '),
	getType = function(obj, type){
		var _type;
		if(obj == null){
			_type = String(obj);
		}
		else{
			_type = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
		}
		return type ? type === _type : _type;
	},
	typeProp = function(type){
		return function(obj){
			return getType(obj, type);
		}
	};
	ds.each(types, function(i, t){
		ds['is' + upperFirst(t)] = typeProp(t);
	});
	ds.extend({
		type : getType
	});
	
	//DOM
	var cssWidth = ['Left', 'Right'],
	cssHeight = ['Top', 'Bottom'],
	elDisplay = {},
	removeEl = function(el){
		el.parentNode && el.parentNode.removeChild(el);
	},
	defaultDisplay = function(nodeName){
		var el, display, db = document.body;
		if(!elDisplay[nodeName]){
			el = createEl(nodeName);
			db.appendChild(el);
			display = css(el, 'display');
			removeEl(el);
			elDisplay[nodeName] = display;
		}
		return elDisplay[nodeName];
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
		$d : $d,
		$D : $D,
		bind : function(el, type, fn){
			el && typeof fn==='function' && addE(el, type, fn);
			return this;
		},
		attr : attr,
		createEl : createEl,
		css : css,
		nodeName : function(el){ return el.nodeName.toUpperCase();},
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
		getPostion : function(el){
			var leftPad = css(el, 'marginLeft'), topPad = css(el, 'marginTop'),
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
		},
		hide : function(el){
			el.style.display = 'none';
		},
		show : function(el, block){
			el.style.display = block ? block===true?'block':block : defaultDisplay(el.nodeName);
		},
		remove : removeEl
	});
	
	//BOM
	var ieVer = (function(){
		// UPDATE: Now using Live NodeList idea from @jdalto
		var v = 3, div = createEl('div'), els = $D('i', div);
		while(div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', els[0]);
		v = v > 4 ? v : undefined;
		div = null;
		return function(ver){
			return isNaN(ver) ? v : v === ver;
		}
	})(),
	isIE = ieVer() !== undefined;
	ds.extend({
		ieVer : ieVer,
		isIE : isIE,
		ieIE6 : ieVer(6)
	});
	
	//string
	var trim = function(str){
		var rLeft = /^\s*/, rRight = /\s*$/;
		return str.replace(rLeft, '').replace(rRight, '');
	}
	ds.extend({
		trim : trim,
		upperFirst : upperFirst
	});
	
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
	};
	ds.extend({
		getXhr : getXhr,
		buildData : function(data){
			var str = '';
			if(data && typeof data === 'object'){
				for(var k in data){
					str += k + '='
					str += data[k] + '&';
				}
				str = str.slice(0, -1);
			}
			else if(typeof data === 'string'){
				str = data;
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
			var _ops = {
				url : '',
				type : 'GET',
				data : null,
				callback : function(){},
				error : function(){},
				cache : false,
				asyn : true
			},
			xhr = getXhr(),
			data = ops.data,
			hasData = !!data,
			isPost;
			for(var k in ops){
				_ops[k] = ops[k];
			}
			isPost = _ops.type.toUpperCase() === 'POST';
			if(hasData){
				data = this.buildData(data);
			}
			if(!isPost){
				_ops.url = this.buildUrl(_ops.url, data, _ops.cache);
			}
			xhr.open(_ops.type, _ops.url, _ops.asyn);
			isPost && xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			//xhr.setRequestHeader('Content-Length', data.length);
			xhr.onreadystatechange = function(){
				var state;
				if(xhr.readyState === 4){
					state =  xhr.status;
					if(state >= 200 && state<300){
						_ops.callback.call(ds.AJAX, xhr.responseText);
					}
					else{
						_ops.error.call(ds.AJAX, state);
					}
				}
			}
			xhr.send(data);
			return this;
		},
		get : function(url, fn, cache){
			return this.ajax({
				url : url,
				type : 'GET',
				callback : fn,
				error : function(status){ ds.debug('XHR ERROR - ' + status);},
				cache : cache
			});
		},
		post : function(url, data, fn){
			return this.ajax({
				url : url,
				type : 'POST',
				data : data,
				callback : fn,
				error : function(status){ ds.debug('XHR ERROR - ' + status);}
			});
		}
	});
	
	//loader 
	ds.extend({
		loadScript : function(url, fn){
			var el = createEl('script', {'type':'text/javascript', 'src':url}), head = $D('head')[0],
			type = 'readystatechange', supportState = 'on' + type in el, stateStr = 'loaded complete';
			type = supportState ? type : 'load';
			addE(el, type, function(){
				if(!supportState || stateStr.indexOf(el.readyState) > -1){
					typeof fn==='function' && fn.call(this);
					removeE(el, type, arguments.callee);
				}
			});
			head.appendChild(el);
			//head.insertBefore(el, head.firstChild);
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
		}
	});
	
	//Event
	ds.extend({
		fixEvent : function(e){
			e = e || window.event;
			if(e.target){
				return e;
			}
			var newE = {}, el;
			
			//拷贝， 不要直接写event for best
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
			el = e.srcElement;
			el = el && el.nodeType === 3 ? el.parentNode : el;
			newE.target = el || doc;
			el = e.fromElement;
			newE.relatedTarget = e.target=== el ? e.toElement : el;
			//newE.which = e.keyCode;
			return newE;
		}
	});
	
	//fix
	ds.extend({
		setFixed : function(el){
			var i, len, bd = doc.body, docElStr ='(document.documentElement || document.body)',
			style, pos, left, top;
			if(isIE6){
				if(isArray){
					for(i=0, len = el.length; i<len; i++){
						ds.setFixed(el[i]);
					}
					return;
				}
				//更改背景模式
				if(css(bd, 'backgroundAttachment') !== 'fixed'){
					css(bd, {'backgroundImage':'url(about:blank)', 'backgroundAttachment':'fixed'});
				}
				el = $d(el);
				style = el.style;
				pos = ds.getPostion(el);
				left = pos.left;
				top = pos.top;
				el.style.position = 'absolute';
				style.setExpression('left', 'eval("' + docElStr + '.scrollLeft + ' + left + '") + "px"');
				style.setExpression('top', 'eval("' + docElStr + '.scrollTop + ' + top + '") + "px"');
			}
		}
	});
	
	//ready
	ds.extend({
		//DOM加载完成
		ready : (function(ds){
			var handlers = [], readyBound = false, isReady = false,
			domEvtStr = 'DOMContentLoaded', ieEvtStr = 'readystatechange',
			_DOM = doc.addEventListener, docEl = doc.documentElement, readyHandler,
			fire = function(){
				if(!doc.body){
					setTimeout(fire, 16);
				}
				if(!isReady){
					isReady = true;
					for(var i =0, len = handlers.length; i<len; i++){
						handlers[i].call(doc);
					}
					handlers = [];
				}
			},
			scrollCheck = function(){
				try{
					docEl.doScroll('left');
				}
				catch(_){
					setTimeout(scrollCheck, 32);
					return;
				}
				fire();
			},
			bind = function(fn){
				if(typeof fn === 'function'){
					handlers.push(fn);
				}
				if(!readyBound){
					var topLevel = false;
					addE(doc, _DOM ? domEvtStr : ieEvtStr, readyHandler);
					//保险
					try{
						topLevel = window.frameElement == null;
					}
					catch(_){}
					if(_DOM){
						addE(window, 'load', readyHandler);
					}
					else if(docEl && topLevel){
						scrollCheck();
					}
				}
				readyBound = true;
			};
			if(_DOM){
				readyHandler = function(){
					removeE(doc, domEvtStr, readyHandler);
					fire();
				}
			}
			else{
				readyHandler = function(){
					if(doc.readyState === 'complete'){
						removeE(doc, ieEvtStr, readyHandler);
						fire();
					}
				}
			}
			return function(fn){
				if(isReady){
					console.log(1);
					fn.call(doc);
				}
				else bind(fn);
				return this;
			}
		})()
	});
	
	//animate
	ds.extend({
		animate : function(el, ops, delay, callback, easy){
			
		}
	});
	
	//flash
	var flashVer = (function(ds){
		var ver = 0, plg = navigator.plugins, obj = null, support = false,
		str='Shockwave Flash', ieStr = 'ShockwaveFlash.ShockwaveFlash.7';
		if(plg && plg[str]){
			obj = plg[str].description.split(' ');
			ver = parseInt(obj[2], 10);
		}
		else{
			try{
				obj = new ActiveXObject(ieStr);
				ver = parseInt(obj.GetVariable("$version").split(' ')[1], 10);
			}catch(_){}
		}
		return ver || 0;
	})();
	ds.extend({
		supportFlash : flashVer>0,
		flashVer : flashVer,
		getFlashHTML : function(url, width, height, id, ops){
			var opsStr = '', html,
			httpPri = /^https/.test(location.href) ? 'http://' : 'https://',
			_ops = {
				wmode : 'transparent',
				bgcolor : '#ffffff',
				allowFullScreen : 'false',
				allowScriptAccess : 'always',
				loop : 'false',
				menu : 'false',
				quality : 'best'
			};
			for(var k in ops){
				_ops[k] = ops[k];
			}
			for(var k in _ops){
				opsStr += isIE ? ('<param name="' + k + '" value="' + _ops[k] + '" />') : (k + '="' + _ops[k] + '" ');
			}
			id = id || 'ds_flash_' + getGuid();
			//默认透明背景
			html = isIE ? //<param name="flashvars" value="' + flashvars + '"/>
				'<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="' + httpPri + 'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="' + width + '" height="' + height + '" id="' + id + '"><param name="movie" value="' + url + '" />' + opsStr + '</object>' :
				'<embed id="' + id + '" src="' + url + '" width="' + width + '" height="' + height + '" name="' + id + '"  type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" ' + opsStr + ' />';
			return html;
		}
	});
	
	//dsBox
	ds.extend({
		'dsBox' : {
			links : [],
			ops : {
				initHeight : 240,
				initWidth : 240,
				defalutHeight : 480,
				defaultWidth : 640,
				flashPlayer : 'swf/player.swf',
				shade : true,
				captionAnimate : true,
				cssFile : 'style/dsbox.css',
				shell : document.body,
				autoShow : false
			},
			init : function(ops){
				var _ops = this.ops;
				ds.extend(_ops, ops);
				this.loadStyle();
				this.layout();
				this.fire();
			},
			fire : function(){
				var panel = $d(this.ops.shell), links = $D('a', panel), el, rel,
				re = /^dsbox/i, self = this;
				//rel="dsBox[640,480,groupName1]"
				for(var i=0, len=links.length; i<len; i++){
					el = links[i];
					rel = el.rel;
					if(el.href && rel && re.test(rel)){
						ds.bind(el, 'click', (function(el){
							return function(e){
								self.show(el);
								e.preventDefault();
							}
						})(el));
					}
				}
				this.links = links;
			},
			loadStyle : function(){
				var self = this;
				ds.loadStyle(this.ops.cssFile, function(){
					setTimeout(function(){ self.autoShow()}, 120);
				});
			},
			layout : function(){
				var createEl = ds.createEl, frag = document.createDocumentFragment(),
				overDiv = this.overDiv = createEl('div', {className:'dsbox_over_div'}),
				mainPanel = this.boxPanel = createEl('div', {className:'dsbox_main_panel'}),
				main = this.mainBox = createEl('div', {className:'dsbox_main'}),
				bottomPanel = this.bottomPanel = createEl('div', {className:'dsbox_bottom'}),
				bottom = this.bottom = createEl('div', {className:'dsbox_bottom_main'}),
				caption = this.caption = createEl('h3'),
				closeBtn = createEl('a', {href:'#'});
				var ops= this.ops, self = this,
				hideHandler = function(e){
					self.hide();
					e && e.preventDefault && e.preventDefault();
				};
				ds.bind(closeBtn, 'click', hideHandler);
				ds.bind(overDiv, 'click', hideHandler);
				ds.bind(document, 'keydown', function(e){
					if(e.keyCode === 27){
						hideHandler(e);
					}
				});
				
				bottom.appendChild(caption);
				bottom.appendChild(closeBtn);
				bottomPanel.appendChild(bottom);
				mainPanel.appendChild(main);
				mainPanel.appendChild(bottomPanel);
				frag.appendChild(overDiv);
				frag.appendChild(mainPanel);
				document.body.appendChild(frag);
			},
			show : function(el){
				//rel="dsBox[640,480,groupName1]"
				var rel = el.rel, wh = [], gName,
				ops = this.ops, w, h,
				panel = this.boxPanel, pWH;
				rel = rel.slice(5).replace(/\[([^\]]+)\]/, function(s0, str){
					return str;
				}).split(',');
				for(var i=0,len=rel.length; i<len; i++){
					if(!isNaN(rel[i])){
						wh.push(rel[i]);
					}
					else{
						gName = rel[i];
					}
				}
				w = this.currWidth = isNaN(wh[0]) ? ops.defaultWidth : wh[0];
				h = this.currHeight = isNaN(wh[1]) ? ops.defalutHeight : wh[1];
				this.mainBox.innerHTML = ds.getFlashHTML(ops.flashPlayer + '?file=' + el.href, w, h, 'dsbox_player', {'wmode':'window'});
				this.caption.innerHTML = el.title;
				//ds.css(this.mainBox, 'width', w + 'px');
				ds.css(this.bottomPanel, 'width', w + 'px');
				ds.show(panel);
				pWH = ds.getWH(panel);
				ds.css(panel, {'marginLeft':(-pWH.width/2)+'px', 'top':(ds.getWindowSize().height/12 + ds.pageScrollTop())+'px'});
				ds.css(this.bottom, 'marginTop', 0);
				ds.css(this.overDiv, {'height':ds.getPageSize().height + 'px', 'display':'block'});
			},
			hide : function(){
				this.mainBox.innerHTML = '';
				ds.hide(this.boxPanel);
				ds.hide(this.overDiv);
			},
			autoShow : function(){
				var hash = location.hash.slice(1), links = this.links, el;
				if(hash !== ''){
					for(var i=links.length-1; i>=0; i--){
						el = links[i];
						if(el.href.lastIndexOf(hash) > el.href.indexOf('#')){
							this.show(el);
						}
					}
				}
			}
		}
	});
	
	//other
	ds.extend({
		saveHTML : function(name, html){
			var win = window.open('', '', 'left=160, top=200, width=10, height=10'), docEl;
			try{
				docEl = win.document;
				docEl.open('text/html', 'replace');
				docEl.write(html);
				docEl.execCommand("saveas", "", name + ".html");
				docEl = null;
				win.close();
			}
			catch(ex){
				win.blur();
				win.close();
				alert('网页保存失败，可能您的浏览器不支持此操作');
			}
			win = null;
		}
	});
	
	//debug
	ds.extend({
		debug : function(str){
			getType(window.console) !== 'undefined' ? console.log(str) : alert(str);
		}
	});
	
	window.ds = ds;
	
	
	return;  //立下待调试
	//localStorage
	var 
	ieUserData = null,
	ds = {
		supportLocalStorage : !!window.localStorage,
		data : function(name, val){
			var pri = 'ds_data_', stor = window.localStorage, support = ds.supportLocalStorage;
			name = pri + name;
			if(val === undefined){
				return support ? stor[name] : this.userData(name);
			}
			support ? (stor[name] = val) : this.userData(name, val);
			return this;
		},
		getUserData : function(){
			var data = ieUserData, d;
			//必须等文档加载完成
			if(isIE && !data){
				d = new Date();
				d.setDate(d.getDate() + 30);
				try{
					data = createEl('input', {type:'hidden'});
					data.addBehavior ("#default#userData"); 
					data.expries = d.toUTCString();
					doc.body.appendChild(data);
				}catch(_){}
				ieUserData = data;
			}
			return data;
		},
		userData : function(name, val, del){
			var data = this.getUserData(), key = 'ds_data';
			if(data){
				data.load && data.load(key);
				if(del === true && !!name){
					data.removeAttribute(name);
				}
				else if(val === undefined){
					return data.getAttribute(name);
				}
				data.setAttribute(name, val);
				data.save && data.save(key);
			}
			return this;
		},
		removeData : function(name){
			var pri = 'ds_data_', stor = window.localStorage;
			if(this.supportLocalStorage){
				stor[name] &&　stor.removeItem(name);
				return this;
			}
			return this.userData(name, '', true);
		},
		//缓存所有的剪贴板
		clipBoards : {},
		//flash部分摘自 zeroClipboard 这个部分搞的人想死
		addClipboard : function(ops){
			var 
			el,	_noop = function(){},
			_ops = {
				id : 'copycode',
				autoReposition : true,
				clickHandler :_noop,
				complete : _noop,
				handCursor : true
			};
			for(var k in ops){
				_ops[k] = ops[k];
			}
			el = $d(_ops.id);
			if(!el){ return null;}
			var  id = 'ds_clipboard_' + getGuid(),
			bd = doc.body, div = createEl('div', {id:id+'_panel'}),
			h = el.offsetHeight, w = el.offsetWidth,
			pos = ds.getOffset(el), left = pos.left, top = pos.top,
			getTopInx = function(el){
				var offEl = el, tmpEl = el,
				rroot = /^(?:html|body)$/i, zInx;
				while(offEl){
					tmpEl = offEl;
					offEl = offEl.offsetParent;
					if(!offEl || rroot.test(offEl.nodeName)){
						offEl = tmpEl;
						break;
					}
				}
				tmpEl = null;
				zInx = css(offEl, 'zIndex');
				return !zInx || isNaN(zInx) ? 3 : ++zInx;
			};
			css(div, {height:h+'px', width:w+'px', left:left+'px', top:top+'px', zIndex:getTopInx(el)+'', position:'absolute'});
			div.innerHTML = ds.getFlashHTML('js/clipboard.swf', w, h, id, {'flashvars' : 'id=' + id + '&width=' + w + '&height=' + h});
			bd.appendChild(div);
			return ds.clipBoards[id] = {
				id : id,
				backEl : el,
				cursor : !!_ops.handCursor,
				flash : $d(id),
				panel : div,
				setText : _noop,
				load : function(){
					var self = this, flash = self.flash;
					try{
						flash.setHandCursor(this.cursor);
						this.setText = function(str){
							flash.setText(str + '');
						}
						flash.setClickHandler('function(id){var clipObj = ds.clipBoards[id];clipObj.clickHandler();}');
					}catch(_){}
					if(_ops.autoReposition){
						addE(window, 'resize', function(){self.rePosition();});
					}
				},
				clickHandler : function(){
					this.setText(_ops.clickHandler());
				},
				complete : function(str){
					typeof _ops.complete === 'function' && _ops.complete.call(this, str);
				},
				rePosition : function(){
					var el = this.backEl, style = this.panel.style,
					pos = ds.getOffset(el);
					style.left = pos.left + 'px';
					style.top = pos.top + 'px';
				},
				remove : function(){
					if(div && div.parentNode){
						div.innerHTML = '';
						div.parentNode.removeChild(div);
					}
				}
			}
		},
		//触发事件代理
		clipboardFire : function(id, type, args){
			var clipObj = ds.clipBoards[id];
			type = type || 'load';
			if(clipObj){
				clipObj[type](args);
			}
		}
		
	}

	//挂载
	window.ds = ds;
})(window);
