/*
	-- 基于jQuery(1.7)扩展插件 ScrollBar --
author : _米
create : 2012.02.13
update : 2011.02.14
-- 接口说明 --
	- @Param options {Object} #2011.02.13#
		- {
			bar : null,
			shell : null,
			content : null,
			barShell : null,
			backBtn : null,
			forwardBtn : null,
			step : 60,
			scroll : 0,
			minSize : 36,
			duration : 320,
			wheel : true,
			animate : true,
			refresh : false,
			onscroll : _noop,
			onbof : _noop,
			oneof : _noop
		}
-- 接口说明 end --
*/
;(function(global, document, $, undefined){
	var 
	win = $(global),
	DOC = $(document),
	_noop = function(){},
	_ops = {
		bar : null,
		shell : null,
		content : null,
		barShell : null,
		backBtn : null,
		forwardBtn : null,
		step : 100,
		scroll : 0,
		minSize : 36,
		duration : 320,
		wheel : true,
		animate : true,
		refresh : false,
		onscroll : _noop,
		onbof : _noop,
		oneof : _noop
	},
	_mix = function(source, target){
		$.each(source, function(k, val){
			if(target[k] === undefined){
				target[k] = val;
			}
		});
		return target;
	},
	_ease = function(t){return (t*=2)<1?.5*t*t:.5*(1-(--t)*(t-2));},
	_getScroll = function(){ return this.scroll;},
	_wheel = function(e, ops){
		var _scroll = this.scroll;
		if(!this.animate && ops.wheel){
			if(e.delta > 0 && _scroll > 0){
				this.setScroll(_scroll - ops.step);
				e.preventDefault();
			}
			else if(e.delta < 0 && _scroll < this.maxScroll){
				this.setScroll(_scroll + ops.step);
				e.preventDefault();
			}
		}
	},
	_bind = function(ops){
		var 
		self = this,
		_t = null,
		_keepDir = 0,
		_keepFire = false,
		_keepScroll = function(){
			_t = setTimeout(function(){
				_keepFire = true;
				self.setScroll(self.scroll + ops.step * _keepDir);
				_keepScroll();
			}, 500);
		},
		_wheelFn = function(e){
			_wheel.call(self, e, ops);
		};
		//wheel
		if(ops.wheel && this.shell.mousewheel){
			this.shell.mousewheel(_wheelFn);
			this.barShell.mousewheel(_wheelFn);
		}
		//resize
		ops.refresh && win.resize(function(){ self.refresh();});
		//btn
		if(ops.forwardBtn){
			ops.forwardBtn.click(function(e){
				e.preventDefault();
				!_keepFire && !self.animate && self.scrollTo(self.scroll + ops.step);
				_keepFire = false;
			})
			.mousedown(function(){
				_keepDir = 1;
				_keepScroll();
			})
			.mouseup(function(e){
				_keepDir = 0;
				global.clearTimeout(_t);
			});
		}
		if(ops.backBtn){
			ops.backBtn.click(function(e){
				e.preventDefault();
				!_keepFire && !self.animate && self.scrollTo(self.scroll - ops.step);
				_keepFire = false;
			})
			.mousedown(function(){
				_keepDir = -1;
				_keepScroll();
			})
			.mouseup(function(e){
				_keepDir = 0;
				global.clearTimeout(_t);
			});
		}
	},
	_scrollTo = function(offset){
		if(!isFinite(offset) || offset === this.scroll) return this;
		if(!this.ops.animate) return this.setScroll(offset);
		var 
		self = this,
		ops = this.ops,
		tMark = new Date(),
		duration = ops.duration,
		_offset = this.scroll,
		_size = this._fixedScroll(offset) - _offset,
		fx = function(){
			var tMap = new Date() - tMark;
			if(tMap >= duration){
				self.animate = false;
				self.setScroll(offset);
				return;
			}
			self.setScroll(_offset +  _size * _ease(tMap / duration));
			self._timer = setTimeout(fx, 16);
		}
		this.animate = true;
		this.stop();
		fx();
		return this;
	},
	_stop = function(){
		this.animate = false;
		global.clearTimeout(this._timer);
		return this;
	},
	BarX = global.ScrollBarX = function(ops){
		this.init(_mix(_ops, ops));
	},
	BarY = global.ScrollBarY = function(ops){
		this.init(_mix(_ops, ops));
	};
	BarX.prototype = {
		constructor : BarX,
		init : function(ops){
			this.ops = ops;
			var 
			bar = this.bar = $(ops.bar),
			shell = this.shell = $(ops.shell),
			content = this.content = $(ops.content),
			barShell = this.barShell = $(ops.barShell);
			this.scroll = shell.scrollLeft();
			if(ops.scroll !== this.shell.scrollLeft()){
				this.scroll = ops.scroll;
			}
			this.refresh();
			this.bind();
		},
		refresh : function(){
			this.shellWidth = this.shell.width();
			this.contentWidth = this.content.width();
			this.barShellWidth = this.barShell.width();
			this.ratio = this.barShellWidth / this.contentWidth;
			this.maxScroll = this.contentWidth - this.shellWidth;
			this.barShellOffsetX = this.barShell.offset().left;
			//layout
			this.bar.css('width', Math.max(this.ops.minSize, this.shellWidth * this.ratio));
			return this.scrollTo(this.scroll);
		},
		bind : function(){
			var 
			self = this,
			ops = this.ops,
			bar = this.bar;
			bar.click(function(e){
				e.stopPropagation();
			})
			.mousedown(function(e){
				self._drag = true;
				self._offsetX = e.pageX - bar.offset().left;
				e.preventDefault();
				e.stopPropagation();
			});
			DOC.mousemove(function(e){
				if(self._drag){
					self.setScroll((e.pageX - self.barShellOffsetX - self._offsetX) / self.ratio);
					//bar.css('left', e.pageX - self.barShellOffsetX - self._offsetX);
					e.preventDefault();
				}
			})
			.mouseup(function(e){ self._drag = false; });
			this.barShell.click(function(e){
				e.preventDefault();
				e.target === this && self.scrollTo((e.pageX - self.barShellOffsetX - bar.width()/2) / self.ratio);
			});
			_bind.call(this, ops);
		},
		getScroll : _getScroll,
		_fixedScroll : function(offset){
			return parseInt(Math.max(0, Math.min(this.maxScroll, offset)), 10);
		},
		setScroll : function(offset){
			var 
			ops = this.ops,
			_offset = this._fixedScroll(offset);
			if(this.scroll != _offset){
				this.scroll = _offset;
				this.shell.prop('scrollLeft', _offset);
				this.bar.css('left', _offset * this.ratio);
				ops.onscroll.call(this, _offset);
				($.type(ops.onscroll) === 'function' ? ops.onscroll : _noop).call(this, _offset);
			}
			if(_offset <= 0){
				ops.onbof.call(this, _offset);
			}
			else if(_offset >= this.maxScroll){
				ops.oneof.call(this, _offset);
			}
			return this;
		},
		scrollTo : _scrollTo,
		stop : _stop
	};
	BarY.prototype = {
		constructor : BarY,
		init : function(ops){
			this.ops = ops;
			var 
			bar = this.bar = $(ops.bar),
			shell = this.shell = $(ops.shell),
			content = this.content = $(ops.content),
			barShell = this.barShell = $(ops.barShell);
			this.scroll = shell.scrollTop();
			if(ops.scroll !== this.shell.scrollLeft()){
				this.scroll = ops.scroll;
			}
			this.refresh();
			this.bind();
		},
		refresh : function(){
			this.shellHeight = this.shell.height();
			this.contentHeight = this.content.height();
			this.barShellHeight = this.barShell.height();
			this.ratio = this.barShellHeight / this.contentHeight;
			this.maxScroll = this.contentHeight - this.shellHeight;
			this.barShellOffsetY = this.barShell.offset().top;
			//layout
			this.bar.css('height', Math.max(this.ops.minSize, this.shellHeight * this.ratio));
			return this.scrollTo(this.scroll);
		},
		bind : function(){
			var 
			self = this,
			ops = this.ops,
			bar = this.bar;
			bar.click(function(e){
				e.stopPropagation();
			})
			.mousedown(function(e){
				self._drag = true;
				self._offsetY = e.pageY - bar.offset().top;
				e.preventDefault();
				e.stopPropagation();
			});
			DOC.mousemove(function(e){
				if(self._drag){
					self.setScroll((e.pageY - self.barShellOffsetY - self._offsetY) / self.ratio);
					e.preventDefault();
				}
			})
			.mouseup(function(e){ self._drag = false; });
			this.barShell.click(function(e){
				e.preventDefault();
				e.target === this && self.scrollTo((e.pageY - self.barShellOffsetY - bar.height()/2) / self.ratio);
			});
			_bind.call(this, ops);
		},
		getScroll : _getScroll,
		_fixedScroll : function(offset){
			return parseInt(Math.max(0, Math.min(this.maxScroll, offset)), 10);
		},
		setScroll : function(offset){
			var 
			ops = this.ops,
			_offset = this._fixedScroll(offset);
			if(this.scroll != _offset){
				this.scroll = _offset;
				this.shell.prop('scrollTop', this.scroll);
				this.bar.css('top', _offset * this.ratio);
				($.type(ops.onscroll) === 'function' ? ops.onscroll : _noop).call(this, _offset);
			}
			if(_offset <= 0){
				ops.onbof.call(this, _offset);
			}
			else if(_offset >= this.maxScroll){
				ops.oneof.call(this, _offset);
			}
			return this;
		},
		scrollTo : _scrollTo,
		stop : _stop
	};
})(this, this.document, jQuery);