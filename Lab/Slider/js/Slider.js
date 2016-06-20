/*
author : laoshu133
update : 2011.08.27
www.laoshu133.com
*/
//Slider obj
(function(window){
	var 
	doc = window.document,
	$d = ds.$d,
	slider = function(ops){
		var _ops = this._ops;
		ds.mix(ops, _ops);
		this.init(ops);
		this.autoPlay();
	};
	slider.prototype = {
		constructor : slider,
		_ops : {
			shell : doc.body,
			navEl : void 0,
			animateEl : null,
			direction : 'left',
			itemNodeName : 'li',
			trigger : 'mouseenter',
			unitSize : 500,
			duration : 400,
			delay : 4200,
			auto : true,
			isAnimate : true
		},
		init : function(ops){
			var panel = $d(ops.shell),
			fxEl = $d(ops.animateEl || ds.$D('ul', panel)[0]),
			hasNav = ops.navEl !== null,
			addNav = typeof ops.navEl === 'string' && !$d(ops.navEl),
			navEl = addNav ? ds.createEl('div', {id : ops.navEl}) : $d(ops.navEl),
			items = [], nodeName = ops.itemNodeName.toLowerCase(),
			tmpItems = fxEl.childNodes;
			for(var i = 0,j = 0, len=tmpItems.length; i<len; i++){
				if(tmpItems[i].nodeType === 1 && tmpItems[i].nodeName.toLowerCase() === nodeName){
					items[j++] = tmpItems[i];
				}
			}
			//动画属性
			this.prevInx = 0;
			this.dirIsTop = (ops.direction === 'top');
			this.fxEl = fxEl;
			//部分结构
			this.navEl = navEl;
			this.navLinks = addNav ? [] : ds.$D('a', navEl);
			//对象属性
			this.addNav = addNav,
			this.hasNav = hasNav,
			this.items = items;
			this.itemCount = items.length;
			this.ops = ops;
			this.panel = panel;
			this.layout();
			this.bind();
		},
		layout : function(){
			var ops = this.ops,
			isTop = this.dirIsTop,
			unitName = isTop ? 'height' : 'width',
			items = this.items,
			navEl = this.navEl,
			frag = doc.createDocumentFragment(),
			navLinks = this.navLinks,
			size = ops.unitSize,
			len = items.length,
			el, i = 0;
			if(this.addNav){
				navEl.className = ops.navEl;
				for(; i<len; i++){
					el = ds.createEl('a', {href:'#', hideFocus:true});
					el.innerHTML = (i + 1);
					navLinks.push(el);
					frag.appendChild(el);
					ds.css(items[i], unitName, size + 'px');
				}
				navEl.appendChild(frag);
				this.panel.appendChild(navEl);
			}
			ds.css(this.fxEl, unitName, (len * size) + 'px');
			if(this.hasNav) navLinks[0].className = 'hover';
		},
		bind : function(){
			var el,
			self = this,
			panel = this.panel,
			ops = this.ops,
			links = this.navLinks,
			play = function(inx){
				if(inx !== self.prevInx){
					self.play(inx);
				}
			};
			if(this.hasNav){
				for(var i = 0, len = this.itemCount; i<len; i++){
					el = links[i];
					ds.bind(el, 'click', (function(inx){
						return function(e){
							play(inx);
							e.preventDefault();
						}
					})(i));
					ds.bind(el, ops.trigger, (function(inx){
						return function(e){
							play(inx);
						}
					})(i));
				}
			}
			ds.hover(panel, function(){
				self.stopAuto();
			}, function(){
				self.autoPlay();
			});
		},
		play : function(inx){
			var 
			ops = this.ops,
			links = this.navLinks,
			prevInx = this.prevInx,
			size = ops.unitSize,
			aniObj = {},
			leftSize = 0;
			inx = isFinite(inx) ? inx : (prevInx + 1) % this.itemCount;
			leftSize = -size * inx;
			if(this.hasNav){
				links[prevInx].className = '';
				links[inx].className = 'hover';
			}
			aniObj[this.dirIsTop ? 'marginTop' : 'marginLeft'] = leftSize + 'px';
			ds.stop(this.fxEl).animate(this.fxEl, aniObj, ops.isAnimate ? ops.duration : 0);
			this.prevInx = inx;
		},
		autoPlay : function(){
			var 
			self = this,
			delay = this.ops.delay,
			ansyLoop = function(){
				self.play();
				self._timer = setTimeout(function(){
					ansyLoop();
				}, delay);
			};
			if(this.ops.auto){
				this.autoPlaying = true;
				this._timer = setTimeout(function(){ansyLoop();}, delay);
			}
		},
		stopAuto : function(){
			if(this.ops.auto){
				this.autoPlaying = false;
				window.clearTimeout(this._timer);
			}
		}
	}
	window.Slider = slider;
})(window);