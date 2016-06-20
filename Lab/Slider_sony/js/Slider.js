//Slider
//构建对象
(function($){
	var 
	createEl = function(tag, ops){
		var el = document.createElement(tag);
		for(var k in ops){
			el[k] = ops[k];
		}
		return el;
	},
	slider = 
	window.Slider = function(ops){
		ops = ops || {};
		$.each(this._ops, function(k, val){
			if(typeof ops[k] === 'undefined'){
				ops[k] = val;
			}
		});
		this.init(ops);
		this.autoPlay();
	};
	slider.prototype = {
		constructor : slider,
		_ops : {
			shell : document.body,
			autoPlay : true,
			items : [],
			pageSize : 4,
			pageWidth : 840,
			enterDelay : 240,	//鼠标经过延迟
			delay : 4200		//自动播放间隔时间
		},
		init : function(ops){
			var 
			panel = this.panel = ops.shell;
			//配置
			this.prevInx = -1;
			this.pageInx = 0;
			this.pageCount = parseInt(ops.items.length / ops.pageSize);
			this.ops = ops;
			//构建
			this.layout();
			//事件绑定
			this.bind();
			//首次动画
			this.play(0);
		},
		layout : function(){
			var 
			//ops
			ops = this.ops,
			items = ops.items,
			len = items.length,
			//elems
			elems = [],
			frag = document.createDocumentFragment(),
			navPanel = this.nav = createEl('div', {className:'slider_nav'}),
			navMain = this.navMain = createEl('div', {className:'slider_nav_main'}),
			navUl =  createEl('ul'),
			navPrev = createEl('a', {className:'slider_prev', href:'#', innerHTML:'上一组', hideFocus:true}),
			navNext = createEl('a', {className:'slider_next', href:'#', innerHTML:'下一组', hideFocus:true}),
			item, img, aLink,
			nLink, nLi, nSpan,
			i = 0;
			for(; i<len; i++){
				item = items[i];
				img = createEl('img', {alt:'', src:ops.baseUrl + item.url});
				aLink = createEl('a', {href:item.target, title:item.title, className:'slider_item'});
				aLink.style.zIndex = len - i + 1;
				aLink.appendChild(img);
				frag.appendChild(aLink);
				nSpan = createEl('span', {innerHTML:item.title});
				nLink = createEl('a', {title:item.title, href:item.target, hideFocus:true});
				nLi = createEl('li', {className:'slider_' + item.type});
				nLink.appendChild(nSpan);
				nLi.appendChild(nLink);
				navUl.appendChild(nLi);
				//堆入
				elems[i] = {aLink:aLink, nLink:nLink};
			}
			navPanel.style.zIndex = len + 5;
			navMain.appendChild(navUl);
			$(navPanel).append(navMain, navPrev, navNext);
			this.panel.append(frag, navPanel);
			this.elems = elems;
		},
		bind : function(){
			var 
			self = this,
			nav = $(this.nav),
			navLis = nav.find('li'),
			pageCount = this.pageCount,
			delay = this.ops.enterDelay,
			_t = null;
			//下一组，上一组
			nav.find('a[class^=slider]').click(function(e){
				var inx = self.pageInx + (this.className.indexOf('next') > 0 ? 1 : -1);
				if(inx < 0) inx = pageCount - 1;
				if(inx >= pageCount) inx = 0;
				self.focusPage(inx);
				return false;
			});
			//激活当前
			nav.find('li>a').click(function(){
				return false;
			})
			.hover(function(){
				var inx = navLis.index(this.parentNode);
				window.clearTimeout(_t);
				_t = setTimeout(function(){
					self.play(inx);
				}, delay);
			}, function(){
				window.clearTimeout(_t);
			});
			//鼠标移入
			$(this.panel).hover(function(){
				self.stopAuto();
			}, function(){
				self.autoPlay();
			});
			//$(this.nav).find('li > a').bind();
		},
		focusPage : function(inx){
			var 
			ops = this.ops,
			self = this,
			navMain = $('.slider_nav_main>ul'),
			unitSize = ops.pageWidth;
			inx = isFinite(inx) ? inx : this.pageInx + 1;
			inx = parseInt(Math.max(0, Math.min(inx, this.pageCount - 1)));
			navMain.animate({
				marginLeft : unitSize * -inx
			}, 400, function(){
				self.pageInx = inx;
			});
		},
		play : function(inx){
			var ops = this.ops,
			len = ops.items.length,
			pageSize = ops.pageSize,
			len = ops.items.length,
			prevInx = this.prevInx,
			//elems
			elems = this.elems,
			aLink;
			inx = (isFinite(inx) ? inx : prevInx + 1) % len;
			if(inx == prevInx) return;
			aLink = $(elems[inx].aLink)
			if(prevInx > -1){
				$(elems[prevInx].aLink).css('zIndex', len);
				$(elems[prevInx].nLink).removeClass('hover');
			}
			$(elems[inx].nLink).addClass('hover');
			aLink.css('zIndex', len + 2);
			aLink.find('img').eq(0).css('opacity', 0).animate({opacity:1}, 420);
			//aLink.find('img').fadeIn(320);
			this.marquee(inx);
			this.focusPage(parseInt(inx / pageSize));
			this.prevInx = inx;
		},
		marquee : function(inx){
			var 
			prevInx = this.prevInx,
			nLink = $(this.elems[inx].nLink),
			span = nLink.find('span').eq(0),
			nWidth = nLink.width(),
			width = span.width(), 
			//60px/s
			delay = width / 60;
			//匀速运动
			function fx(){
				span.animate({'marginLeft':-width}, delay * 1000, 'linear', function(){
					delay = (2 * width + nWidth) / 60;
					span.css('marginLeft', nWidth);
					fx();
				});
			}
			fx();
			if(prevInx < 0) return;
			$(this.elems[prevInx].nLink).find('span:eq(0)').stop(true).css('marginLeft', 0);
		},
		autoPlay : function(){
			var 
			self = this,
			ops = this.ops,
			delay = ops.delay;
			this.stopAuto();
			if(ops.autoPlay){
				this.timer = setTimeout(function(){
					self.play();
					self.autoPlay();
				}, delay);
			}
		},
		stopAuto : function(){
			window.clearTimeout(this.timer);
		}
	}
})(jQuery);