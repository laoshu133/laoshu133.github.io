/*
	-- 基于jQuery(1.7)扩展事件 mousesheel --
author : _米
create : 2012.02.13
update : 2011.02.13
-- 用法说明 --
	$(selector).mousewheel(fn);
	$(selector).bind('mousewheel', fn);
	fn = function(e){
		e.delta > 0 ? up : down
	}
-- 用法说明 end --
*/
;(function(global, document, $, undefined){
	var 
	id = 0,
	_event = $.event,
	w3c = !!document.dispatchEvent,
	_addE = w3c ? function(el, type, fn){
		el.addEventListener(type, fn, false);
	} : function(el, type, fn){
		var $el = $(el), id = $el.data('__mw_id');
		!id && $el.data('__mw_id', (id = '_mw_' + ++id));
		fn[id + '_' + type] = function(){
			fn.call(el, global.event);
		};
		el.attachEvent('on' + type, fn[id + '_' + type]);
	},
	_removeE = w3c ? function(el, type, fn){
		el.removeEventListener(type, fn, false);
	} : function(el, type, fn){
		var id = $(el).data('__mw_id');
		if(id){
			el.detachEvent('on' + type, fn[id + '_' + type]);
		}
	},
	_handler = function(e){
		var 
		_e = _event.fix(e),
		args = [].slice.call(arguments, 1);
		_e.delta = 0;
		_e.type = 'mousewheel';
		if(e.wheelDelta){
			_e.delta = e.wheelDelta / 3;
			global.opear && (_e.delta = -_e.delta);
		}
		else if(e.detail){
			_e.delta = -e.detail / 3;
		}
		args.unshift(_e);
		_event.handle.apply(this, args);
		//$(this).trigger('mousewheel', args);
	};
	_event.special.mousewheel = {
		setup : function(){
			_addE(this, 'mousewheel', _handler);
			_addE(this, 'DOMMouseScroll', _handler);
		},
		teardown : function(){
			_removeE(this, 'mousewheel', _handler);
			_removeE(this, 'DOMMouseScroll', _handler);
		}
	};
	$.fn.extend({
		mousewheel : function(fn){
			return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
		}
	});
})(this, this.document, jQuery);