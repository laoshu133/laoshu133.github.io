//星级评分
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
		el.attachEvent('on' + type, fn);
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
	
	//构建函数
	starLevel = function(ops){
		var _ops = {
			shell : doc.body,
			items : [],
			defaultLevel : 0,
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
			var items = ops.items, i = 0, len = items.length, url = ops.url, text, level, deLevel = ops.defaultLevel,
			panel = $d(ops.shell), ul, li, a, span, frag = doc.createDocumentFragment(), links = [];
			attr(panel, 'className', 'star_level');
			ul = createEl('ul');
			for(; i<len; i++){
				level = items[i].level;
				text = items[i].text;
				items[i].index = i;
				li = createEl('li');
				li.className = level===deLevel ? 'star_curr' : '';
				a = createEl('a', {href:url.replace('%s',level), title:text, hidefocus:true});
				a.innerHTML = text;
				span = createEl('span');
				span.innerHTML = level;
				li.appendChild(a);
				li.appendChild(span);
				frag.appendChild(li);
				links.push(a);
			}
			ul.appendChild(frag);
			panel.appendChild(ul);
			this[0] = panel;
			this.links = links;
		},
		//绑定事件
		bind : function(){
			var self = this, links = self.links, items = self.ops.items,
			inx, 
			changeStar = function(inx, selected){
				return function(e){
					if(self.selected){
						preventDefault(e);
						return;
					}
					var level = items[inx].level, i = inx - level, midLevel = items[i].level, isUp;
					isUp = level>midLevel;
					for(i=isUp ? i-1 : i+1; i>=0 && i<len;){
						i = isUp ? i+1 : i-1;
						if((isUp && i>inx) || (!isUp && i<inx)){
							break;
						}
						if(!selected){
							links[i].className = 'hover';
						}
						else{
							links[i].parentNode.className = 'selected';
						}
					}
					if(!!selected){
						self.selected = true;
						self.ops.onSelect.call(items[inx], e, (e.target || e.srcElement).href);
					}
				}
			};
			for(var i=0, len=links.length; i<len; i++){
				inx = items[i].index;
				addE(links[i], 'mouseover', changeStar(inx));
				addE(links[i], 'mouseout', function(){
					for(var i=0; i<len; i++){
						links[i].className = '';
					}
				});
				addE(links[i], 'click', changeStar(inx, true));
			}
		},
		//复位选项
		resetAll : function(){
			if(!this.selected){
				return;
			}
			var links = this.links, items = this.ops.items, it,
			str, len = links.length, level, midLevel = this.ops.defaultLevel;
			for(var i=0; i<len; i++){
				it = links[i];
				level = items[i].level;
				it.className = '';
				it.parentNode.className = level=== midLevel ? 'star_curr' : '';
			}
			this.selected = false;
		}
	}
	window.StarLevel = starLevel;
})(window);