(function(window){
	var 
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
	
	bend = function(ops){
		var _ops = this.ops;
		for(var k in ops){
			_ops[k] = ops[k];
		}
		this.init(_ops);
		this.run();
	}
	bend.prototype = {
		constructor : bend,
		ops : {
			id : 'bendLink',
			curl : 'images/curl.png',
			maxWidth : 62
		},
		// 摘自 Tween, Quad
		quad : function(t,b,c,d){
			if ((t/=d/2) < 1){
				return c/2*t*t + b;
			}
			return -c/2 * ((--t)*(t-2) - 1) + b;
		},
		init : function(ops){
			var panel = $d(ops.id), img = doc.createElement('img');
			if(!panel) return;
			img.alt = '';
			img.src = ops.curl;
			img.className = 'bend_curl'
			panel.appendChild(img);
			this.curl = img;
			this[0] = panel;
		},
		setSize : function(w){
			var style = this.curl.style;
			style.width = w + 'px';
		},
		getTar : function(){
			var self = this;
			if(!self.getTared){
				addE(doc, 'mousemove', function(e){
					self._tar = e.target || e.srcElement;
				});
			}
		},
		contains : doc.documentElement.contains ? function(el){
			return this[0] !== el && this[0].contains(el);
		} : function(el){
			return !!(this[0].compareDocumentPosition(el) & 16);
		},
		run : function(){
			var self = this, img = self.curl, maxWidth = self.ops.maxWidth, w, delay = 16;
			addE(self[0], 'mouseover', function(){
				var t = new Date().getTime(), c = parseInt(css(img, 'width'), 10), d = 272, now;
				clearInterval(self.timer);
				self.timer = setInterval(function(){
					now = new Date().getTime();
					w = Math.ceil(c - self.quad(now-t, 0, c, d));
					if(w<=0 || now-t >= d){
						clearInterval(self.timer);
						return;				
					}
					self.setSize(w);
				}, delay);
			});
			addE(self[0], 'mouseout', function(e){
				var t = new Date().getTime(), b = parseInt(css(img, 'width'), 10), c = maxWidth, d = 360, now;
				setTimeout(function(){
					if(!self.contains(self._tar)){
						clearInterval(self.timer);
						self.timer = setInterval(function(){
							now = new Date().getTime();
							w = Math.ceil(self.quad(now-t, b, c, d));
							if(w>=maxWidth || now-t >= d){
								clearInterval(self.timer);
								return;				
							}
							self.setSize(w);
						}, delay);
					}
				}, delay);
			});
			if(!this.getTared){
				self.getTar();
			}
		}
	}
	window.Bend = bend;
})(window);