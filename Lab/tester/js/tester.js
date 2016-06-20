/*
author : laoshu133
update : 2011.05.20
www.laoshu133.com
*/
;(function(window, undefined){
	var 
	guid = 0,
	doc = window.document,
	$d = function(id){return "string" == typeof id ? document.getElementById(id) : id;},
	$D = function(tag, context){ return (context || doc).getElementsByTagName(tag);},
	addE = doc.addEventListener ? function(el, type, fn){
		el.addEventListener(type, fn, false);
	} : function(el, type, fn){
		var pri = type + '_' + fn;
		fn[pri] = function(){
			fn.call(el, window.event);
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
		else if(typeof val === 'string'){
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
	isArray = function(arr){ return Object.prototype.toString.call(arr) === '[object Array]';},
	ieVer = (function(){
		// UPDATE: Now using Live NodeList idea from @jdalto
		var v = 3, div = createEl('div'), els = $D('i', div);
		while(div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', els[0]);
		v = v > 4 ? v : undefined;
		div = null;
		return function(ver){
			return isNaN(ver) ? v : v === ver;
		}
	})(),
	isIE = ieVer() !== undefined,
	isIE6 = ieVer(6),
	getXhr = function(){
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
	
	ieUserData = null,
	
	debugEl = null,
	ds = {
		$d : $d,
		$D : $D,
		bind : addE,
		atr : attr,
		createEl : createEl,
		css : css,
		trim : function(str){
			var rLeft = /^\s*/, rRight = /\s*$/;
			return str.replace(rLeft, '').replace(rRight, '');
		},
		isArray : isArray,
		isIE : isIE,
		ieVer : ieVer,
		isIE6 : isIE6,
		loadJs : function(url, fn){
			var el = createEl('script', {'type':'text/javascript', 'src':url}), head = $D('head')[0],
			type = 'readystatechange', supportState = 'on' + type in el;
			type = supportState ? type : 'load';
			addE(el, type, function(){
				if(!supportState || supportState && el.readyState === 'loaded'){
					fn.call(this);
				}
			});
			head.appendChild(el);
			//head.insertBefore(el, head.firstChild);
		},
		getPostion : function(el){
			var leftPad = css(el, 'marginLeft'), topPad = css(el, 'marginTop'),
			left = el.offsetLeft, top = el.offsetTop;
			leftPad = parseFloat(leftPad) || 0;
			topPad = parseFloat(topPad) || 0;
			return {left : left-leftPad, top : top-topPad};
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
				/*if(e.type.indexOf('key') !== -1){
					try{
						e.keyCode = 0;
					}
					catch(ex){}
				}*/
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
			return newE;
		},
		AJAX : {
			getXhr : getXhr,
			buidData : function(data){
				var str = '';
				if(data && typeof data === 'object'){
					for(i in data){
						str += i + '=' + _ops.data[i] + '&';
					}
					str = str.slice(-1);
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
				data = _ops.data,
				hasData = !!data,
				isPost = _ops.type.toUpperCase() === 'POST',
				i;
				for(var i in ops){
					_ops[i] = ops[i];
				}
				if(hasData){
					data = this.buildData(data);
				}
				if(!isPost){
					_ops.url = this.buildUrl(_ops.url, data, _ops.cache);
				}
				xhr.open(_ops.type, _ops.url, _ops.asyn);
				isPost && xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');//x.setRequestHeader('Content-Length', data.length);
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
			}
		},
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
				alert('网页保存失败,可能您的浏览器不支持此操作');
			}
			win = null;
		},
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
			id = id || 'ds_flash_' + (guid++);
			//默认透明背景
			html = isIE ? //<param name="flashvars" value="' + flashvars + '"/>
				'<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="' + httpPri + 'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="' + width + '" height="' + height + '" id="' + id + '"><param name="movie" value="' + url + '" />' + opsStr + '</object>' :
				'<embed id="' + id + '" src="' + url + '" width="' + width + '" height="' + height + '" name="' + id + '"  type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" ' + opsStr + ' />';
			return html;
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
			var  id = 'ds_clipboard_' + guid++,
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
		},
		
		
		//Debug 部分
		debug : function(msg){
			var li, ol = $D('ol', debugEl);
			if(ol[0]){
				li = createEl('li');
				li.innerHTML = msg;
				ol[0].appendChild(li);
			}
			debugEl.scrollTop = debugEl.scrollHeight;
		},
		setDebugID : function(id){
			debugEl = $d(id);
		},
		clearDebug : function(){
			var lis = $D('li', debugEl), ol = $D('ol', debugEl)[0];
			ol.parentNode.replaceChild(ol.cloneNode(false), ol);
		}
	},
	
	/*tester 私有属性*/
	reSizeTimer = null,
	testerDataKey = 'tester_code',
	tester = function(ops){
		var _ops = {
			shell : 'main',
			coder : 'coder',
			links : 'links',
			btnsPanel : 'btns',
			editUrl : 'editarea/edit_area_full.js',
			runPanel : 'run_panel',
			debug : true
		}
		for(var k in ops){
			_ops[k] = ops[k];
		}
		this.init(_ops);
		this.loadCode();
		this.loadRunPanel();
		this.initEditor();
		this.bind();
		//初始化复制功能
		this.initClipboard();
	}
	tester.prototype = {
		constructor : tester,
		init : function(ops){
			this[0] = $d(ops.coder);
			this[1] = $d(ops.shell);
			this[2] = $d(ops.links);
			this[3] = $d(ops.runPanel);
			this.coder = this[0];
			this.coderId = this[0].id;
			this.ops = ops;
			this.debug('初始化成功.');
		},
		loadCode : function(){
			var editor = this.editor, str = ds.data(testerDataKey);
			if(!!str){
				editor ?  editor.setValue(this.coderId, str) : (this[0].value = str);
			}
		},
		initEditor : function(){
			var self = this, ops = self.ops,
			initEditor = function(){
				var id = self[0].id, editor = editAreaLoader;
				editor.init({
					id : id,
					font_family : 'Arial',
					font_size : 12,
					word_wrap : true,
					syntax : 'html',
					language : 'zh',
					//toolbar: 'new_document,fullscreen, | ,undo, redo, | ,search, go_to_line, |, highlight, reset_highlight, |, select_font, |, syntax_selection',
					toolbar: 'new_document, | ,undo, redo, | ,search, go_to_line, |, highlight, reset_highlight, |, select_font, |, syntax_selection',
					syntax_selection_allow: 'css,html,js,php,python,xml,sql',
					allow_toggle : false,
					allow_resize : false,
					start_highlight: true
				});
				self.editor = editor;
				self.reLoadCoder(id);
			};
			///AJAX 动态加载 悲剧鸟
			/*ds.AJAX.get(ops.editUrl, function(str){
				var  head = $D('head')[0],
				el = createEl('script', {'type':'text/javascript'});
				el.text = str;
				head.appendChild(el);
				initEditor();
			}, true);*/
			///动态创建 script 悲剧鸟
			/*ds.loadJs(ops.editUrl, function(){
				//editAreaLoader.execCommand('coder', 'EA_init');
				initEditor();
			});*/
			///直接写 script 标签 
			!!editAreaLoader && initEditor();
		},
		loadRunPanel : function(){
			var panel = this[3], self = this, id = panel.id + '_back', panelBack = $d(id),
			ifa;
			if(!panelBack || panelBack.nodeType !== 3){
				panelBack = createEl('div', {id:id, className:id});
			}
			panel.parentNode.appendChild(panelBack);
			this.panelBack = panelBack;
			this.panelBackState = 'none';
			addE(panelBack, 'click', function(){
				self.toggleRunPanel(false);
			});
			
			id = 'run_iframe_' + self.coderId;
			ifa = createEl('iframe', {id:id, name:id, src:'about:blank'});
			//fix IE7
			ifa.setAttribute('frameborder', 0, 0);
			panel.appendChild(ifa);
			self.runIframe = ifa.contentWindow;
		},
		toggleRunPanel : function(showOrHide){
			var state = showOrHide ? 'block' : 'none';
			if(this.panelBackState !== state){
				this[3].style.display = state;
				this.panelBack.style.display = state;
				this.panelBackState = state;
				showOrHide && this.reSize();
			}
		},
		reLoadCoder : function(id){
			var self = this,
			fn = function(){
				if(self.coderLoaded){
					return;
				}
				self[0] = $d('frame_' + id);
				if(self[0] && self[0].nodeType === 1){
					self.coderLoaded = true;
					self.debug('editArea 初始化成功');
					self.coderBind();
					//延迟执行，编辑器初始化, -----IE6,7会主动触发window.resize
					setTimeout(function(){self.reSize();}, 1000);
				}
				setTimeout(fn, 32);
			};
			fn();
		},
		getCode : function(){
			var editor = this.editor, id = this.coderId;
			return editor ? editor.getValue(id) : $d('editor').value;
		},
		saveCode : function(){
			ds.data('tester_code', this.getCode());
		},
		reSize : function(){
			var 
			self = this, ops = self.ops,
			panelHeight = 0, panelWidth = 0, panelPad = 126, coderPad = 104,
			pageSize = ds.getWindowSize(), maxHeight = pageSize.height, maxWidth = pageSize.width,
			Max = Math.max, h, w,
			panelBack = self.panelBack,
			fn = function(){
				h = Max(maxHeight-panelPad, panelPad);
				css(self[1], 'height', h + 'px');
				//panelHeight = self[1].offsetHeight;
				h = Max(h-coderPad, coderPad);
				self[0] && css(self[0], {'height':h + 'px', 'width':'99%'});
				self.clipboard && self.clipboard.rePosition();
				self.debug('重设编辑区高度 - ' + h);
			}
			if(self.panelBackState === 'block'){
				css(panelBack, {width:maxWidth + 'px', height:maxHeight + 'px'});
				panelWidth = maxWidth * 0.8;
				css(self[3], {'width':panelWidth+'px', 'marginLeft':(-panelWidth/2)+'px'});
				if(isIE6){
					panelHeight = maxHeight * 0.7;
					css(self[3], 'height', panelHeight + 'px');
				}
			}
			//延迟执行reSize,防止执行过于频繁
			!!reSizeTimer && clearTimeout(reSizeTimer);
			reSizeTimer = setTimeout(fn, 160);
			//fn();
		},
		keyDownHandler : function(){
			var self = this;
			return function(e){
				var code = e.keyCode, tag = String.fromCharCode(code), respond = false;
				e = ds.fixEvent(e);
				//IE6(IETESTER)不监听特殊功能键，Ctrl, ESC ==
				//快速功能
				if(e.altKey && self.tags[tag]){
					self.insertHTML(tag);
					respond = true;
				}
				//Ctrl + Enter _ 貌似在IE6下不来米
				if(e.ctrlKey && code === 13 || code === 10){
					self.runCode(!!e.altKey);
					respond = true;
				}
				//隐藏运行框
				if(code === 27){
					self.toggleRunPanel(false);
				}
				//取消默认行为
				respond && e.preventDefault();
			}
		},
		bind : function(){
			var self = this,
			btnTags = {
				runcode : function(){ this.runCode();},
				runcode_new : function(){ this.runCode(true);},
				savecode : function(){
					ds.saveHTML('test_laoshu133.com', self.getCode());
				},
				savetolocal : function(){
					self.saveCode();
					self.debug('代码暂存成功');
				}
			};
			//窗口改变大小时，重新调整大小
			addE(window, 'resize', function(){
				self.reSize();
			});
			//清空控制台
			addE(debugEl, 'dblclick', function(e){
				e = ds.fixEvent(e);
				ds.clearDebug();
				e.preventDefault();
			});
			//快速功能
			addE(self[2], 'click', function(e){
				e = ds.fixEvent(e);
				var tar = e.target;
				tar.nodeName === 'A' && self.insertHTML(tar.title.slice(-1));
				e.preventDefault();
			});
			//快捷键
			addE(doc, 'keydown', self.keyDownHandler());
			//功能按钮
			addE($d(self.ops.btnsPanel), 'click', function(e){
				e = ds.fixEvent(e);
				var tar = e.target, tag = btnTags[tar.id || tar.name];
				if(tar.nodeName === 'INPUT' && tag){
					tag.call(self, tar);
				}
				e.preventDefault();
			});
			
			//退出页面清理缓存
			addE(window, 'unload', function(e){
				//e = ds.fixEvent(e);
				//if(window.confirm('！！代码尚未保存\n您需要代码暂存本地吗？')){
					self.saveCode();
				//}
				self.coderIframe = null;
				self.runIframe = null;
				self.editor = null;
				self = null;
			});
			
			self.debug('完成事件绑定');
		},
		coderBind : function(){
			//iframe 页面事件绑定
			var self = this, ifaWin = self[0].contentWindow, ifaDoc = ifaWin.document;
			addE(ifaDoc, 'keydown', function(e){
				e = e || ifaWin.event;
				self.keyDownHandler()(e);
			});
			self.coderIframe = ifaWin;
			self.debug('编辑器事件绑定完成');
		},
		initClipboard : function(){
			//代码复制
			var self = this, editor = this.editor,
			getVal = function(){
				return editor ? self.getCode() : '';
			};
			var clip = ds.addClipboard({
				id : 'copycode',
				autoReposition : false,
				clickHandler : function(){ return getVal();},
				complete : function(){self.debug('代码成功复制至剪贴板');},
				handCursor : true
			});
			self.clipboard = clip;
		},
		tags : {
			'Q' : '<script type="text/javascript" src="js/jquery_1.3.2.js"><\/script>',
			'S' : ['<script type="text/javascript">\n', '\n<\/script>'],
			'C' : ['<style type="text/css">\n', '\n</style>'],
			'N' : function(){
				var editor = this.coderIframe.editArea;
				editor.new_document();
			},
			'F' : function(){
				var editor = this.coderIframe.editArea;
				editor.show_search();
			},
			'R' : function(){
				this.reSize();
			},
			'K' : function(){
				ds.AJAX.get('readme.txt', function(str){
					alert(str);
				}, true);
			}
		},
		insertHTML : function(code){
			var self = this, tags = self.tags, tag = tags[code] ? tags[code] : ['',''],
			editor = self.editor, id = self.coderId;
			if(!!editor){
				if(ds.isArray(tag)){
					editor.insertTags(id, tag[0], tag[1]);
				}
				else if(typeof tag === 'function'){
					tag.call(self, id);
				}
				else{
					editor.insertTags(id, tag, '');
				}
			}
			else{
				self.error('编辑器尚未初始化完成');
			}
		},
		runCode : function(newWin){
			var str = newWin ? 'window' : 'iframe', d = new Date(),
			self = this, id = this.coderId,
			ifaWin = self.runIframe, ifaDoc = ifaWin.document,
			rLeft = /^\s*/,rhtml = /^<(html|!DOCTYPE)/i,
			ifaHandler = function(e){
				e = ds.fixEvent(e || ifaWin.event);
				
				//IE6(IETESTER)不监听特殊功能键; ctrl,esc ==
				if(e.keyCode === 27){
					!!ifaWin.opener ? ifaWin.close() : self.toggleRunPanel(false);
				}
				e.preventDefault();
			},
			html = ds.trim(this.getCode());
			if(rhtml.test(html)){
				this.toggleRunPanel(!newWin);
			}
			else{
				html = html.indexOf('<script') > -1 ? html : '<script type="text/javascript">' + html + '<\/script>';
			}
			//debug
			this.debug('<span style="float:right; *margin-top:-22px;">' + d.getMinutes() + ':' + d.getSeconds()　+ '</span>[Run-' + str + ']');

			removeE(ifaDoc, 'keydown', ifaHandler);
			if(newWin){
				ifaWin = window.open(location.href, '_blank', '');
				ifaDoc = ifaWin.document;
			}
			ifaDoc.open("text/html", "replace");
			ifaDoc.write(html);
			ifaDoc.close();
			addE(ifaDoc, 'keydown', ifaHandler);
			//FIX IE
			isIE && ifaWin.focus();
		},
		
		debug : function(msg){
			if(this.ops.debug){
				ds.debug('JSTester - ' + msg);
			}
			return this;
		},
		error : function(msg){
			ds.debug('[Error]-<span style="color:red;">' + msg + '</span>');
		}
	};
	
	//挂载
	window.ds = ds;
	window.JSTester = tester;
})(window);
