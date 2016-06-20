//重写 ds.event 模块
//www.laoshu133.com/ds.js
//author:laoshu133
//构建模拟
(function(window, undefined){
	var doc = window.document,
	
	//简单的实现类类库操作
	ds = (function(){
		var ds = function(id){
			return new ds.fn.init(id);
		};
		ds.fn = ds.prototype = {
			constructor : ds,
			init : function(id){
				var obj = typeof id === 'object' ? id : doc.getElementById(id);
				this[0] = obj;
				this.length = 1;
				return this;
			},
			bind : function(type, fn){
				var evt = ds.event;
				evt.props[type] ? evt[type](this[0], fn) : evt.add(this[0], type, fn);
				return this;
			},
			unbind : function(type, fn){
				ds.event.remove(this[0], type, fn);
				return this;
			},
			hover : function(enterFn, leaveFn){
				return this.bind('mouseenter', enterFn).bind('mouseleave', leaveFn);
			},
			contains : function(inner){
				return ds.contains(this[0], inner);
			}
		}
		ds.fn.init.prototype = ds.prototype;
		return ds;
	})();
	ds.contains = function(wrap, inner){
		return wrap.contains ? wrap!==inner && wrap.contains(inner) : !!(wrap.compareDocumentPosition(inner) & 16);
	}
	
	
	//封装事件操作
	ds.event = (function(){
		var 
		_guid = 1,
		_DOM = doc.addEventListener,
		cache = {},
		_addE = function(el, type, fn){
			_DOM ? el.addEventListener(type, fn ,false) :  el.attachEvent('on' + type, fn);
		},
		_removeE = function(el, type, fn){
			_DOM ? el.removeEventListener(type, fn ,false) :  el.detachEvent('on' + type, fn);
		},
		_build = function(guid){
			return function(e){
				e = fix(e);
				var i = 0, data = arguments,
				el = cache[guid]['elem'], events = cache[guid]['events'][e.type];
				for(; i<events.length; i++){
					events[i].apply(el, data);
				}
			}
		},
		fix = function(e){
			e = e || window.event;
			if(_DOM){
				return e;
			}
			var newE = {};
			//拷贝event
			for(var k in e){
				newE[k] = e[k];
			}
			//fix
			newE.target = e.srcElement || document;
			if(newE.target.nodeType === 3){
				newE.target = newE.target.parentNode;
			}
			newE.preventDefault = function(){ e.returnValue = false;};
			newE.stopPropagation = function(){ e.cancelBubble = true;};
			newE.relatedTarget = e.fromElement && e.fromElement !== newE.target ? e.fromElement : e.toElement;
			return newE;
		}
		return {
			add : function(el, type, fn){
				var guid = el['guid'], events, typeList;
				if(!guid){
					guid = el['guid'] = _guid++;
					cache[guid] = {
						elem : el,
						events : {},
						listener :_build(guid)
					}
				}
				events = cache[guid].events;
				if(!events[type]){
					events[type] = [];
					_addE(el, type, cache[guid]['listener']);
				}
				events[type].push(fn);
			},
			remove : function(el, type, fn){
				var guid = el['guid'], i = 0, events, handler = cache[guid], typeList;
				if(!guid){
					return;
				}
				events = handler.events;
				console.log(cache[guid].events);
				if(fn){
					typeList = events[type];
					for(i = typeList.length; i>=0; i--){
						if(typeList[i] === fn){
							typeList.splice(i, 1);
						}
					}
					if(typeList.length === 0){
						_removeE(el, type, handler.listener);
					}
				}
				else if(type){
					delete events[type];
					_removeE(el, type, handler.listener);
				}
				else{
					for(i in events){
						_removeE(el, i, handler.listener);
					}
					delete events;
				}
			}
		}
	})();
	ds.event.props =  {
		mouseenter : true,
		mouseleave : true
	}
	ds.event.mouseenter = (function(){
		var target, _t, self = ds.event,
		type = 'mouseenter',
		delay = 16, isOver = false, callback,
		mouseover = function(el, fn){
			return function(){
				var data = arguments;
				clearTimeout(_t);
				if(!isOver){
					isOver = true;
					//data[0].type = type;
					fn.apply(el, data);
				}
			}
		},
		mouseout = function(el){
			return function(e){
				var data = arguments, tar = e.target;
				_t = setTimeout(function(){
					if(!ds.contains(el, tar)){
						isOver = false;
					}
				}, delay);
			}
		}
		mouseenter = function(el, fn){
			if('on' + type in el){
				self.add(el, type, fn);
				return;
			}
			self.add(el, 'mouseover', mouseover(el, fn));
			self.add(el, 'mouseout', mouseout(el));
		};
		self.add(doc, 'mousemove', function(e){
			target = e.target;
		});
		return mouseenter;
	})();
	ds.event.mouseleave = (function(){
		var target, _t, self = ds.event,
		type = 'mouseleave', delay = 64,
		mouseover = function(){
			_t && clearTimeout(_t);
		},
		mouseout = function(el, fn){
			return function(e){
				var data = arguments, tar = e.target;
				_t = setTimeout(function(){
					if(!ds.contains(el, tar)){
						fn.apply(el, data);
					}
				}, delay);
			}
		}
		mouseleave = function(el, fn){
			if('on' + type in el){
				self.add(el, type, fn);
				return;
			}
			self.add(el, 'mouseover', mouseover);
			self.add(el, 'mouseout', mouseout(el, fn));
		};
		self.add(doc, 'mousemove', function(e){
			target = e.target;
		});
		return mouseleave;
	})();
	
	window.ds = window.$d = ds;
})(window);