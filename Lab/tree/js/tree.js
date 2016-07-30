//-------------------infos-------------------
//autohor:laoshu133
//update:2011.04.18
//测试兼容浏览器 IE6+ ,FF3+, CHROME10
(function(win, doc){
	var 
	//私有方法
	$d = function(id){ return document.getElementById(id);},
	$D = function(tag, context){ return (context || doc).getElementsByTagName(tag);},
	addE = function(el, type, fn){
		if(el.addEventListener){
			el.addEventListener(type, fn, false);
		}
		else if(el.attachEvent){
			var pri = type + '_' + fn;
			fn[pri] = function(){
				fn.call(el, window.event);
			}
			el.attachEvent('on' + type, fn[pri]);
		}
	},
	addClass = function(el, name){
		var n = el.className, re = new RegExp('(?:^|\\s+)' + name + '(?:\\s+|$)');
		if(!re.test(n)){
			re = /\s*$/;
			el.className = n.replace(re, function(){ return (n!==''?' ':'') + name;});
		}
	},
	removeClass = function(el, name){
		var n = el.className, re = new RegExp('(^|\\s+)' + name + '(\\s+|$)');
		if(n.indexOf(name) !== -1){
			el.className = n.replace(re, function($0, $1, $2){
				return ($1 === '' || $2 === '') ? '' : ' ';
			});
		}
	},
	attr = function(el, name, val){
		var others = {
			'for' : 'htmlFor',
			'css' : 'cssText'
		};
		if(typeof val !== 'undefined'){
			el.setAttribute(!others[name]?name:others[name], val);
		}
		else{
			el.getAttribute(name);
		}
	},
	css = function(el, name, val){
		if(typeof val !== 'undefined'){
			el.style[name] = val;
		}
		else{
			return el.currentStyle ? el.currentStyle[name] : doc.defaultView.getComputedStyle(el, null)[name];
		}
	},
	createEl = function(name, ops){
		var el = doc.createElement(name);
		for(var k in ops){
			attr(el, k, ops[k]);
		}
		return el;
	},
	append = function(el, node){
		var args = arguments;
		if(args.length > 2){
			for(var i = 1, len = args.length; i<len; i++){
				el.appendChild(args[i]);
			}
		}
		else{
			return el.appendChild(node);
		}
	},
	prevEl = function(el){
		do{
			el = el.previousSibling;
		}while(el && el.nodeType !== 1);
		return el;
	},
	nextEl = function(el){
		do{
			el = el.nextSibling;
		}while(el && el.nodeType !== 1);
		return el;
	},
	preventDefault = function(e){
		if(e.preventDefault){
			e.preventDefault();
		}
		else{
			e.returnValue = false;
		}
	},
	
	//构造函数
	Tree = win.Tree = function(ops){
		if(!this instanceof Tree){ return;}
		//重建参数
		for(var k in ops){
			this.ops[k] = ops[k];
		}
		this[0] = $d(this.ops['shell']);
		this.init();
		
	}
	Tree.prototype={
		constructor : Tree,
		ops : {
			root: 'base.gif',
			folder: 'folder.gif',
			folderOpen: 'folderopen.gif',
			file: 'page.gif',
			empty: 'empty.gif',
			line: 'line.gif',
			join: 'join.gif',
			joinBottom: 'joinbottom.gif',
			plus: 'plus.gif',
			plusBottom: 'plusbottom.gif',
			minus: 'minus.gif',
			minusBottom: 'minusbottom.gif',
			nlPlus: 'nolines_plus.gif',
			nlMinus: 'nolines_minus.gif',
			itemIco: 'item.gif',
			shell: document.body,
			caption: '我的文档',
			url: 'about:blank',
			items : [],
			folderClick: function(){},
			itemClick: function(){}
		},
		styles : '.tree_box dd,.tree_box dl,.tree_box dt{padding:0;margin:0;border:none;font-size:12px;} .tree_box dt img{vertical-align:middle;} .tree_box dt {width:18px;height:18px;} .tree_box dt{white-space:nowrap;} .tree_box a{color:#333;text-decoration:none;padding-left:4px;} .tree_box a:hover,.tree_box .focus a{background:#990000;color:#EEE;}',
		init : function(){
			var ops = this.ops;
			//添加样式
			this.addStyle(this.styles);
			addClass(this[0], 'tree_box');
			//创建一级列表
			this.createRoot(ops);
			//this.createList(ops.items, this[0], ops.caption);
		},
		createRoot : function(ops){
			var it = [{text:ops.caption, items:ops.items}];
			this.createList(it, this[0]);
		},
		createList : function(items, panel){
			var dl, dt, dd, ico, a, it,
			self = this, ops = self.ops, panel = panel || this[0];
			for(var i = 0, len = items.length; i<len; i++){
				it = items[i];
				it.last = i < items.length-1 ? false : true;
				dl = createEl('dl');
				dt = createEl('dt', {title:it.text});
				dd = createEl('dd'),
				ico = createEl('img', {alt:''});
				a = createEl('a',{href:'#'});
				a.innerHTML = it.text;
				if(it.items){
					attr(ico, 'src', ops.url + ops.folder);
					addE(dt, 'click', (function(it, dd){
						return function(e){
							if(!$D('dl', dd).length){
								self.createList(it.items, dd);
							}
							self.toggle(prevEl(dd));
							ops.folderClick.call(it, e);
							preventDefault(e);
						}
					})(it, dd));
				}
				else{
					attr(ico, 'src', ops.url + ops.itemIco);
					attr(a, 'href', it.url);
					attr(a, 'target', '_blank');
					addE(dt, 'click', (function(it){
						return function(e){ ops.itemClick.call(it, e);}
					})(it));
				}
				//添加hover状态
				addE(dt, 'click', function(dt){
					if(self.prevDt){
						self.prevDt.className = '';
					}
					this.className = 'focus';
					self.prevDt = this;
				});
				//装配
				css(dd, 'display', 'none');
				append(dt, this.getLineHtml(it, panel), ico, a);
				append(dl, dt, dd);
				append(panel, dl);
			}
		},
		getLineHtml : function(it, panel){
			var pad = 20, padImg, ops = this.ops, tmpEl, isLast, len, 
			items = [], frag = doc.createDocumentFragment();
			//第一级
			padImg = createEl('img', {alt:''});
			if(it.items){
				attr(padImg, 'src', ops.url + (it.last ? ops.plusBottom : ops.plus));
			}
			else{
				attr(padImg, 'src', ops.url + (it.last ? ops.joinBottom : ops.join));
			}
			items.push(padImg);
			//第二 - N级
			while(panel && panel.tagName.toLowerCase() === 'dd'){
				tmpEl = nextEl(panel.parentNode);
				isLast = (!tmpEl || tmpEl.tagName.toLowerCase() !== 'dl');
				padImg = createEl('img', {alt:'', src:ops.url + (isLast ? ops.empty : ops.line)});
				items.push(padImg);
				panel = panel.parentNode.parentNode;
			}
			//最外层
			len = items.length;
			if(len > 1){
				//padImg = createEl('img', {alt:'', src:ops.url + ops.empty});
				items.length = --len;
				css(items[len-1], 'marginLeft', pad + 'px');
			}
			//压入
			for(var i=len-1; i>=0; i--){
				frag.appendChild(items[i]);
			}
			return frag;
		},
		toggle : function(dt){
			var imgs = $D('img', dt), len = imgs.length,
			lineImg = imgs[len-2], ico = imgs[len-1],
			ops = this.ops, lineSrc = lineImg.src, icoSrc = ico.src,
			dd = nextEl(dt), nextDl = nextEl(dt.parentNode),
			isLast = (!nextDl || nextDl.tagName.toLowerCase() !== 'dl');
			if(css(dd, 'display') !== 'none'){
				this.hide(dt);
				attr(lineImg, 'src', ops.url + (isLast ? ops.plusBottom : ops.plus));
				attr(ico, 'src', ops.url + ops.folder);
			}
			else{
				this.show(dt);
				attr(lineImg, 'src', ops.url + (isLast ? ops.minusBottom : ops.minus));
				attr(ico, 'src', ops.url + ops.folderOpen);
			}
		},
		show : function(dt){
			var dd = nextEl(dt);
			css(dd, 'display', '');
		},
		hide : function(dt){
			var dd = nextEl(dt);
			css(dd, 'display', 'none');
		},
		addStyle : function(cssText){
			var style = createEl('style', {type:'text/css'}), head = doc.getElementsByTagName('head')[0];
			if(style.styleSheet){
				style.styleSheet.cssText = cssText;
			}
			else{
				style.appendChild(doc.createTextNode(cssText));
			}
			head.appendChild(style);
		}
	}
})(window, document);