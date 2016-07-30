(function($){
	var 
	isIE6 = /MSIE 6.0/.test(navigator.userAgent),
	win = $(window),
	body = $('body'),
	//fix IE6 bg
	fixBg = function(){
		var me = arguments.callee;
		if(me.fixed) return;
		if(isIE6 && !fixBg && body.css('backgroundAttachment') != 'fixed'){
			if(!fixBg && body.css('backgroundAttachment') != 'fixed'){
				body.css('backgroundAttachment', 'fixed');
				body.css('backgroundImage') === 'none' && body.css('backgroundImage', 'url(about:blank)');
			}
			me.fixed = true;
		}
	},
	setPosition = function(el){
		if(el.data('prevState') == 'position') return;
		if(el.data('defPosition') == 'absolute'){
			var pos = el.data('defPos');
			el.css({
				left : pos.position.left,
				top : pos.position.top,
				position : 'absolute'
			});
		}
		else{
			el.css('position', 'static');
		}
		el.data('prevState', 'position');
	},
	getOffset = function(el, refresh){
		var 
		pos = el.data('defPos'),
		container = $(el.data('container') || document.body),
		maxWidth = win.width(),
		offset = el.offset();
		if(refresh){
			var 
			padWidth = pos.maxWidth - maxWidth;
			offset.left -= padWidth / 2;
			offset.top = pos.offset.top;
		}
		return {
			position : refresh ? pos.position : el.position(),
			offset : offset,
			height : el.outerHeight(),
			maxTop : container.offset().top + container.height(),
			maxWidth : maxWidth
		}
	},
	_fixed = function(el, left, top){
		if(!isIE6){
			el.css({
				position : 'fixed',
				left : left || 0,
				top : top || 0
			});
		}
	},
	//只修正top
	setFixed = function(el, topOffset){
		if(el.data('prevState') == 'fixed') return;
		var pos = el.data('defPos');
		_fixed(el, pos.offset.left, topOffset);
		el.data('prevState', 'fixed');
	},
	setMaxFixed = function(el, top){
		//if(el.data('prevState') == 'maxFixed') return;
		_fixed(el, el.data('defPos').offset.left, top)
		el.data('prevState', 'maxFixed');
	},
	scrollHandler = function(e){
		var 
		el = e.data.elem,
		pos = el.data('defPos'),
		topOffset = el.data('topOffset'),
		top = win.scrollTop();
		//console.log('scroll fired', el.data('defPos').offset.left);
		if(top < pos.offset.top - topOffset){
			setPosition(el);
		}
		else{
			if(top + pos.height + topOffset > pos.maxTop) return setMaxFixed(el, pos.maxTop - (top + pos.height + topOffset));
			setFixed(el, topOffset);
		}
	},
	_resize = function(el){
		el.data('defPos', getOffset(el, true));
		el.data('prevState', '');
		win.scroll();
	},
	resizeHandler = function(e){
		var 
		_t,
		el = e.data.elem;
		clearTimeout(el.data('resizeTimer'));
		_t = setTimeout(function(){
			_resize(el);
		}, 32);
		el.data('resizeTimer', _t);
	};
	//@param topOffset  --包含top偏移值
	$.fn.fixedSlider = function(topOffset, container){
		fixBg();
		var 
		win = $(window),
		i = 0,
		len = this.length,
		el, eData;
		for(; i<len; i++){
			el = this.eq(i);
			if(!el.data('defPos')){
				el.data('topOffset', topOffset);
				el.data('container', container);
				el.data('defPos', getOffset(el));
				el.data('defPosition', el.css('position'));
			}
			eData = {elem:el};
			setPosition(el);
			win.bind('scroll', eData, scrollHandler)
			.bind('resize', eData, resizeHandler)
			.scroll();
		}
		
	};
})(jQuery);