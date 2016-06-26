//星级评分 2
//author - 米
//http://laoshu133.com
//@param
//@shell - 用于创建评论星级的容器id, string
//@items - 所有的星级项目，object - {[level:0, text:'0星'],...}
//@url - 用于外部请求的url,会被赋值给a.href, url必须包含"%s"关键字，会自动替换%s为相应的星级
//@defaultLevel - 默认选择的星级
//obj.resetAll - 外部可以调用方法,用于清除已选择的星级
(function(window, undefined){
	var 
	//私有属性
	doc = window.document,
	$d = function(id){return "string" == typeof id ? document.getElementById(id) : id;},
	addE = doc.addEventListener ? function(el, type, fn){
		el.addEventListener(type, fn, false);
	} : function(el, type, fn){
		var pri = type + '_' + fn;
		fn[pri] = function(){ fn.call(el, window.event);};
		el.attachEvent('on' + type, fn[pri]);
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
	preventDefault = function(e){
		if(e.preventDefault){
			e.preventDefault();
		}
		else{
			e.returnValue = false;
		}
	},
	contains = doc.documentElement.contains ? function(panel, el){
		return  panel!==el && panel.contains(el);
	} : function(panel, el){
		return !!(panel.compareDocumentPosition(el) & 16);
	},
	getOffset = function(el){
		return el.getBoundingClientRect ? el.getBoundingClientRect() : {left:el.offsetLeft, top:el.offsetTop};
	},
	limit = function(num, minNum, maxNum){
		return Math.min(Math.max(num, minNum), maxNum);
	},
	
	
	//构建函数
	starLevel = function(ops){
		var _ops = {
			shell : doc.body,
			topLevel : 5,
			url : '#?star=%s',
			onSelect : function(){}
		};
		for(var k in ops){
			_ops[k] = ops[k];
		}
		this.ops = _ops;
		this.init(_ops);
		this.bind();
	}
	starLevel.prototype = {
		constructor : starLevel,
		//初始化所有对象，创建必要的HTML结构
		init : function(ops){
			var ul = createEl('ul'), li, a, frag = doc.createDocumentFragment(), panel = $d(ops.shell),
			i = 0, len = ops.topLevel, lis = [];
			for(; i<len; i++){
				li = createEl('li');
				li.innerHTML = i;
				frag.appendChild(li);
				lis.push(li);
			}
			this.lis = lis;
			frag.appendChild(this.createVernier());
			ul.appendChild(frag);
			panel.className = 'star_level';
			panel.appendChild(ul);
			this[0] = panel;
		},
		createVernier : function(){
			var li = createEl('li');
			li.innerHTML = 'xxx';
			li.className = 'vernier';
			this.vernier = li;
			return li;
		},
		//绑定事件
		bind : function(){
			var self = this, panel = self[0], lis = self.lis, docEl = doc.documentElement,
			ops = self.ops, isOut = true, topLevel = ops.topLevel,
			liWidth = self.lis[0].offsetWidth, maxWidth = topLevel * liWidth, vernierWidth = 0,
			getLevel = function(){
				return (vernierWidth/maxWidth * topLevel).toFixed(1);
			};
			addE(panel, 'mousemove', function(e){
				var pageX = 0, w;
				if(!self.selected){
					pageX = e.pageX ? e.pageX : (e.clientX + docEl.scrollLeft - docEl.clientLeft);
					w = pageX - getOffset(this).left;
					vernierWidth = limit(w, 0, maxWidth);
					self.vernier.style.width = vernierWidth + 'px';
					this.title = getLevel() + '星';
				}
			});
			addE(panel, 'mouseout', function(e){
				var isOut = !self.selected && !contains(this, e.target || e.srcElement);
				if(isOut){
					self.resetAll();
				}
			});

			addE(panel, 'click', function(e){
				var vernier = self.vernier, level = getLevel();
				if(!self.selected){
					vernier.className += ' star_curr';
					self.selected = true;
					this.title = level + '星';
					ops.onSelect.call({level:level, url:ops.url.replace('%s', level)}, e);
				}
			});
		},
		//复位选项
		resetAll : function(){
			var vernier = this.vernier;
			this.selected = false;
			vernier.className = 'vernier';
			vernier.style.width = '0';
		}
	}
	window.StarLevel = starLevel;
})(window);
