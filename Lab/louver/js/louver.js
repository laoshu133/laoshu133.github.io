(function(win, doc){
	var 
	$d = function(id){ return doc.getElementById(id);},
	$D = function(tag, context){ return (context || doc).getElementsByTagName(tag);},
	isIE = !-[1,],
	attr = function(el, name, val){
		var others = {
			'for' : 'htmlFor'
		};
		if(typeof val !== 'undefined'){
			if(name !== 'class' && name !== 'className'){
				el.setAttribute(others[name]?others[name]:name, val);
			}else{
				el.className = val;
			}
		}
		else{
			el.getAttribute(name);
		}
	},
	createEl = function(tag, ops){
		var el = doc.createElement(tag);
		for(var k in ops){
			attr(el, k, ops[k]);
		}
		return el;
	},
	append = function(el){
		var args = arguments;
		for(var i=1,len= args.length;i<len;i++){
			el.appendChild(args[i]);
		}
		return el;
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
	
	louver = win.Louver = function(ops){
		var self = this;
		for(var k in ops){
			self.ops[k] = ops[k];
		}
		this.init();
		//首次动画
		this.run();
	};
	louver.prototype = {
		constructor : louver,
		ops : {
			shell : doc.body
		},
		init : function(){
			var ops = this.ops, shell = typeof ops.shell === 'string' ? $d(ops.shell) : ops.shell,
			imgs = $D('img', shell), len = imgs.length;
			this[0] = ops.shell = shell;
			//缓存数据
			shell.className = 'louver';
			this.imgs = imgs;
			this.inx = 0;
			
			//创建列表
			this.createMask();
			this.createLink();
			//.....
			this.maxWidth = shell.offsetWidth;
			this.maxHeight = shell.offsetHeight;
			//首次动画准备
			this.prevInx = len-1;
			css(this[0], 'backgroundImage', 'url(' + imgs[len-1].src + ')');
		},
		createLink : function(){
			var self = this, frag = doc.createDocumentFragment(), linkFrag = doc.createDocumentFragment(),
			links = $D('a', self[0]), pageLinks = [], aLinks = [], a, aLink,
			pageBar = createEl('div', {className: 'page_bar'}),
			linkPanel = createEl('div', {className:'links'});
			for(var i = 0, len = links.length; i<len; i++){
				//a = createEl('a', {href:links[i].href});
				a = createEl('a', {href:'#'});
				a.innerHTML = (i+1);
				frag.appendChild(a);
				css(links[i], 'display', 'none');
				pageLinks[i] = a;
				a.onclick = (function(i){
					return function(){
						self.stopAuto();
						if(self.prevInx !== i){
							self.run(i);
						}
					}
				})(i);
				aLink = createEl('a', {href:links[i].href, target:links[i].target});
				linkFrag.appendChild(aLink);
				aLinks[i] = aLink;
			}
			this.pageLinks = pageLinks;
			this.links = aLinks;
			append(pageBar, frag);
			append(linkPanel, linkFrag);
			append(this[0], linkPanel, pageBar);
		},
		createMask : function(){
			var len = 32, maskPanels = [], masks = [],
			panel, mask, maskPanel = createEl('div', {className:'masks'}),
			frag = doc.createDocumentFragment();
			for(var i=0; i<len; i++){
				panel = createEl('div', {className:'mask_panel'});
				mask = createEl('div', {className:'mask'});
				panel.appendChild(mask);
				frag.appendChild(panel);
				maskPanels[i] = panel;
				masks[i] = mask;
			}
			this.masks = masks;
			this.maskPanels = maskPanels;
			append(maskPanel, frag);
			append(this[0], maskPanel);
		},
		setClip : function(el, t, r, b, l){
			var pos = [t, r, b, l];
			for(var i=0,len=pos.length; i<len; i++){
				pos[i] = pos[i]<0 ? 'auto' : pos[i] + 'px';
			}
			//console.log('rect(' + pos.join(',') + ')');
			css(el, 'clip', 'rect(' + pos.join(',') + ')');
		},
		fxs : [
			[[1,1],function(maskPanels, masks, callback){
				//右下扩充
				var self = this, _t = null,
				panel = maskPanels[0], mask = masks[0],
				maxH = self.maxHeight, maxW = self.maxWidth,
				b = 0, r = 0, delay = 40, timeOut = 600,
				bSpeed = maxH/timeOut * delay, rSpeed = maxW/timeOut * delay,
				speed = 6, tMark = new Date(),
				fx = function(){
					if(r >= maxW || (new Date())-tMark>timeOut){
						clearInterval(_t);
						callback && callback.call(self);
						return;
					}
					b += bSpeed;
					r += rSpeed;
					delay -= speed;
					bSpeed += maxH/timeOut * speed;
					rSpeed += maxW/timeOut * speed;
					self.setClip(mask, 0, r, b, 0);
				}
				_t = setInterval(fx, delay);
			}],
			[[1,1],function(maskPanels, masks, callback){
				//两边扩散
				var self = this, _t = null,
				panel = maskPanels[0], mask = masks[0],
				maxH = self.maxHeight, maxW = self.maxWidth,
				l = maxW/2, r = l, delay = 40, timeOut = 600,
				lSpeed = maxW/timeOut * delay, rSpeed = lSpeed,
				speed = 6, tMark = new Date(),
				fx = function(){
					if(r >= maxW || (new Date())-tMark>timeOut){
						clearInterval(_t);
						callback && callback.call(self);
						return;
					}
					l -= lSpeed;
					r += rSpeed;
					delay -= speed;
					lSpeed += maxH/timeOut * speed;
					rSpeed += maxW/timeOut * speed;
					self.setClip(mask, 0, r, maxH, l);
				}
				_t = setInterval(fx, delay);
			}],
			[[20,1],function(maskPanels, masks, callback){
				//多列展开
				var self = this, _t = null,
				col = self.col, row = self.row,
				maxW = self.maxWidth/col, maxH = self.maxHeight,
				r = 0, delay = 40, timeOut = 600,
				rSpeed = maxW/timeOut * delay,
				speed = 6, tMark = new Date(),
				fx = function(){
					if(r >= maxW || (new Date())-tMark>timeOut){
						clearInterval(_t);
						callback && callback.call(self);
						return;
					}
					r += rSpeed;
					delay -= speed;
					rSpeed += maxW/timeOut * speed;
					for(var i =0; i<col; i++){
						self.setClip(masks[i], 0, r, maxH, 0);
					}
				}
				_t = setInterval(fx, delay);
			}],
			[[1,14],function(maskPanels, masks, callback){
				//向下填充
				var self = this, _t = null,
				col = self.col, row = self.row, len = row,
				maxW = self.maxWidth/col, maxH = self.maxHeight/row,
				b = 0, delay = 40, timeOut = 2000,
				bSpeed = maxH/timeOut * delay,
				speed = 4, tMark = new Date(),
				fx = function(){
					if(b >= maxH || (new Date())-tMark>timeOut){
						clearInterval(_t);
						callback && callback.call(self);
						return;
					}
					b += bSpeed;
					delay -= speed;
					bSpeed += maxW/timeOut * speed;
					for(var i =0; i<len; i++){
						self.setClip(masks[i], 0, maxW, b, 0);
					}
				}
				_t = setInterval(fx, delay);
			}],
			[[8,4], function(maskPanels, masks, callback){
				//格子花
				var self = this, _t = null,
				col = self.col, row = self.row, len = col * row,
				maxW = self.maxWidth/col, maxH = self.maxHeight/row,
				b = maxH/2, t = b, r = maxW/2, l = r, delay = 40, timeOut = 600,
				bSpeed = maxH/timeOut * delay, rSpeed = maxW/timeOut * delay,
				speed = 6, tMark = new Date(),
				fx = function(){
					if(r >= maxW || (new Date())-tMark>timeOut){
						clearInterval(_t);
						callback && callback.call(self);
						return;
					}
					b += bSpeed;
					r += rSpeed;
					t -= bSpeed;
					l -= rSpeed;
					delay -= speed;
					rSpeed += maxW/timeOut * speed;
					for(var i =0; i<len; i++){
						self.setClip(masks[i], t, r, b, l);
					}
				}
				_t = setInterval(fx, delay);
			}]
		],
		layout : function(url, arr){
			var maskPanels = this.maskPanels, masks = this.masks,
			col = arr[0], row = arr[1], len = col*row, mLen = masks.length,
			h = this.maxHeight/row, w = this.maxWidth/col, str;
			this.col = col;
			this.row = row;
			for(var i=0; (i<len && i<mLen); i++){
				str = '-' + ((i % col) * w) + 'px -' + (Math.floor(i / col) * h) + 'px';
				css(maskPanels[i], {height:h+'px', width:w+'px'});
				css(masks[i], {backgroundImage:'url(' + url + ')', backgroundPosition:str, height:h+'px', clip:'rect(0,0,0,0)'});
			}
		},
		run : function(inx){
			var self = this, fxs = self.fxs, fxInx = Math.round((fxs.length-1) * Math.random()),
			imgs = self.imgs, links = self.links, pageLinks = self.pageLinks,
			maskPanels = self.maskPanels, masks = self.masks,
			prevInx = self.prevInx, len = imgs.length, url;
			if(self.isActive){
				return;
			}
			inx = inx || self.inx;
			links[prevInx].className = '';
			pageLinks[prevInx].className = '';
			url = imgs[inx].src;
			self.layout(url, fxs[fxInx][0]);
			self.isActive = true;
			fxs[fxInx][1].call(self, maskPanels, masks, function(){
				self.isActive = false;
				css(self[0], 'backgroundImage', 'url(' + url + ')');
				this.timer = setTimeout(function(){ self.run();}, 3000);
			});
			links[inx].className = 'hover';
			pageLinks[inx].className = 'hover';
			self.prevInx = inx;
			self.inx = (++inx%len);
		},
		stopAuto : function(){
			clearTimeout(this.timer);
		}
	}
})(window, document);