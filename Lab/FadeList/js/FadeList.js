/*
author : laoshu133
update : 2011.08.27
www.laoshu133.com
*/
//FadeList
(function(window){
	var 
	doc = window.document,
	$d = ds.$d,
	guid = 0,
	activeName = 'active',
	fade = function(ops){
		ds.mix(ops, this._ops);
		this.init(ops);
		this.autoPlay();
	};
	fade.prototype = {
		constructor : fade,
		_ops : {
			shell : doc.body,
			navId : null,
			itemNodeName : 'li',
			trigger : 'click',
			auto : true,
			isAnimate : true
		},
		init : function(ops){
			var 
			panel = $d(ops.shell),
			items = ds.$D(ops.itemNodeName, panel);
			
			this.guid = guid++;
			this.panel = panel;
			this.items = items;
			this.itemCount = items.length;
			this.navLinks = [];
			this.mask = ds.createEl('a', {id:'ds_mask_' + guid});
			this.prevInx = 0;
			this.ops = ops;
			this.layout();
			this.bind();
		},
		getItemLink : function(inx){
			var el = this.items[inx], aLink, ret = {href : '#'};
			if(!el || el.nodeType !== 1){ return ret;}
			aLink = el.nodeName.toUpperCase() === 'A' ? el : ds.$D('a', this.panel)[0];
			return aLink ? {href:aLink.href ? aLink.href : '#', target : aLink.target} : ret;
		},
		layout : function(){
			var 
			ops = this.ops,
			len = this.itemCount,
			id = typeof ops.navId === 'string' ? ops.navId : 'ds_fadelist_' + this.guid,
			items = this.items,
			links = this.navLinks,
			panel = this.panel,
			frag = doc.createDocumentFragment(),
			nav = ds.createEl('div', {id : id, className : id}),
			mask = this.mask,
			WH = ds.getWH(panel),
			maskCss = {
				backgroundColor : '#efefef',
				display : 'block',
				height : WH.height + 'px',
				width : WH.width + 'px',
				left : 0,
				top : 0,
				position : 'absolute',
				zIndex : len + 2,
				opacity : 0
			};
			for(var i = 0; i < len; i++){
				links[i] = ds.createEl('a', {href : '#'});
				links[i].innerHTML = i + 1;
				frag.appendChild(links[i]);
				ds.css(items[i], 'zIndex', len - i);
			}
			links[0].className = activeName;
			ds.attr(mask, this.getItemLink(0)).css(mask, maskCss);
			ds.css(nav, 'zIndex', len + 3);
			nav.appendChild(frag);
			panel.appendChild(mask);
			panel.appendChild(nav);
		},
		bind : function(){
			var 
			self = this,
			ops = this.ops,
			panel = this.panel,
			links = this.navLinks,
			len = this.itemCount,
			handler = function(inx){
				return function(e){
					//if(slef.prevInx !== inx){
						self.play(inx);
					//}
					e.preventDefault();
				};
			};
			ds.hover(panel, function(){
				self.stopAuto();
			}, function(){
				self.autoPlay();
			});
			for(var i = 0; i < len; i++){
				ds.bind(links[i], ops.trigger, handler(i));
			}
		},
		play : function(inx){
			var 
			ops = this.ops,
			len = this.itemCount,
			items = this.items,
			links = this.navLinks,
			prevInx = this.prevInx,
			mask = this.mask;
			inx = (isFinite(inx) ? inx : prevInx + 1) % len;
			ds.css(items[prevInx], 'zIndex', len).css(items[inx], 'zIndex', len + 1);
			ds.attr(links[prevInx], 'className', '').attr(links[inx], 'className', activeName);
			if(ops.isAnimate){
				ds.stop(mask).css(mask, 'opacity', 1).animate(mask, {opacity : 0}, ops.duration);
			}
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
	};
	window.FadeList = fade;
})(window);