/*
	-- 基于jQuery扩展插件 fixedSlider --
author : kongge
create : 2011.11.15
update : 2011.11.17
-- 接口说明 --
	- fixedSlider {Function} #2011.11.15# --此方法实现 fixedSlider
	- @Param type {String}/{Number} - String 调用对应的方法，如果存在/Number - type = fixed, 当前参数向后移一位; 目前type 支持以下方法
		- {
			fixed : {Function} --实现当前元素 fixed，当 type 为 数字 时默认调用此方法,
				- @Param topOffset {Number} --距离窗口顶部的偏移值
				- @Param container {Selector} --外层容器，当高度超出容器时停止 fixed 定位，默认 body
			refresh : {Function} --当文档高度发生变化调用，此方法用于刷新容器高度
				- @Param topOffset {Number} --重新设定距离窗口顶部的偏移值
				- @Param refreshOffset {Boolean} --是否需要重新刷新元素本身的偏移值，一般用于当元素以上的元素高度发生变化或者需要改变初始偏移值时，默认 false
		}
	- @Param* {Any} 额外参数集合，具体视第一个参数而定
	- @Return {jQuery}
-- 接口说明 end --
*/
(function($){
	var 
	win = $(window),
	//isIE6 = /MSIE 6.0/.test(navigator.userAgent),
	isIE6 = window.ActiveXObject && !window.XMLHttpRequest,
	//fix IE6 bg
	fixBg = function(){
		var 
		body = $(document.body),
		me = arguments.callee;
		if(me.fixed) return;
		if(isIE6 && !me.fixed && body.css('backgroundAttachment') != 'fixed'){
			body.css('backgroundAttachment', 'fixed');
			body.css('backgroundImage') === 'none' && body.css('backgroundImage', 'url(about:blank)');
			me.fixed = true;
		}
		
	},
	notFixed = function(el){
		if(el.data('prevState') == 'notFixed') return;
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
		if(isIE6){
			var style = el[0].style;
			style.removeExpression('top');
		}
		el.data('prevState', 'notFixed');
	},
	getOffset = function(el, topOffset, refOffset){
		var 
		height = el.outerHeight(),
		container = el.data('container'),
		refOffset = refOffset || !el.data('defPos');
		topOffset = parseInt(topOffset, 10) || 0;
		return {
			height : height,
			offset : refOffset ? el.offset() : el.data('defPos').offset,
			position : refOffset ? el.position() : el.data('defPos').position,
			maxTop : container.offset().top + container.innerHeight() + topOffset - height
		}
	},
	_fixed = isIE6 ? function(el, top){
		var 
		style = el[0].style,
		padTop = parseFloat(el.parent().css('paddingTop')) || 0,
		docStr = '(document.documentElement || document.body)',
		evalStr = 'eval("';
		evalStr += docStr + '.scrollTop - ' + (el.data('defPos').offset.top - padTop - top);
		evalStr += '") + "px"';
		style.position = 'absolute';
		style.setExpression('top', evalStr);
	} : function(el, top){
		el.css({
			position : 'fixed',
			left : 'auto',
			right : 'auto',
			top : top || 0
		});
	},
	//只修正top
	setFixed = function(el, topOffset){
		if(el.data('prevState') == 'fixed') return;
		var pos = el.data('defPos');
		_fixed(el, topOffset);
		el.data('prevState', 'fixed');
	},
	setMaxFixed = isIE6 ? function(el, top){
		var 
		style = el[0].style,
		padTop = parseFloat(el.parent().css('paddingTop')) || 0;
		pos = el.data('defPos'),
		prevState = el.data('prevState');
		if(prevState === 'maxFixed') return;
		style.removeExpression('top');
		if(prevState !== 'fixed'){
			style.position = 'absolute';
		}
		style.top = (pos.maxTop - pos.offset.top + padTop) + 'px';
		el.data('prevState', 'maxFixed');
	} : function(el, top){
		el.data('prevState') !== 'fixed' ? _fixed(el, top) : el.css('top', top);
		el.data('prevState', 'maxFixed');
	},
	_scroll = function(el){
		var 
		top = win.scrollTop(),
		pos = el.data('defPos'),
		topOffset = el.data('topOffset');
		if(top < pos.offset.top - topOffset){
			return notFixed(el);
		}
		if(top > pos.maxTop) return setMaxFixed(el, pos.maxTop - top);
		setFixed(el, topOffset);
	},
	scrollHandler = function(e){
		var 
		el = e.data.elem;
		//clearTimeout(el.data('srcollTimer'));
		//el.data('srcollTimer', setTimeout(function(){
			_scroll(el);
		//}, 16));
	},
	handlers = {
		refresh : function(){
			this.data('defPos', getOffset(this, this.data('topOffset'), arguments[0]));
			scrollHandler({data:{elem:this}});
		},
		fixed : function(topOffset, container){
			if(!this.data('defPos')){
				this.data('topOffset', topOffset);
				this.data('container', $(container || document.body));
				this.data('defPos', getOffset(this, topOffset));
				this.data('defPosition', this.css('position'));
			}
			notFixed(this);
			win.bind('scroll', {elem:this}, scrollHandler).scroll();
		}
	};
	$.fn.fixedSlider = function(){
		var 
		el,
		i = 0,
		top = 0,
		args = arguments,
		len = this.length,
		slice = Array.prototype.slice;
		typeof args[0] === 'number' && Array.prototype.unshift.call(args, 'fixed');
		if(typeof args[0] === 'string' && handlers[args[0]]){
			for(; i<len; i++){
				handlers[args[0]].apply(this.eq(i), slice.call(args, 1));
			}
		}
		//IE6 需要背景fixed
		fixBg();
		return this;
	};
})(jQuery);