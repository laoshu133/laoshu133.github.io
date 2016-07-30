/*
	-- 基于jQuery(1.7)扩展插件 ImgZoom --
author : kongge
create : 2012.02.03
update : 2012.02.07
-- 接口说明 --
	@options {Object}
		- {
			shell : null,
			basePath : 'images/',
			imgASize : [42, 42],
			imgBSize : [163, 163],
			imgCSize : [326, 326],
			imgDSize : [1120, 1120],
			gallerySize : [600, 380],
			items : [
				{
					title : 'PRO 1',
					imgA : 'p_0_0.jpg',
					imgB : 'p_0_1.jpg',
					imgC : 'p_0_2.jpg',
					imgD : 'p_0_3.jpg'
				},
				{
					title : 'PRO 2',
					imgA : 'p_1_0.jpg',
					imgB : 'p_1_1.jpg',
					imgC : 'p_1_2.jpg',
					imgD : 'p_1_3.jpg'
				},
				{
					title : 'PRO 3',
					imgA : 'p_2_0.jpg',
					imgB : 'p_2_1.jpg',
					imgC : 'p_2_2.jpg',
					imgD : 'p_2_3.jpg'
				}
			],
			esc : true,
			drag : true,
			//事件回调, before前缀 如果返回 false 则阻止 zoom
			onBeforeToB : _noop,
			onToB : _noop,
			onBeforeToC : _noop,
			onToC : _noop,
			onBeforeToD : _noop,
			onToD : _noop
		}
-- 接口说明 end --
*/
(function(global, $, undefined){
	var 
	DOC = $(global.document),
	_cacheUrl = {},
	_noop = function(){},
	_ops = {
		shell : null,
		basePath : 'images/',
		imgASize : [42, 42],
		imgBSize : [163, 163],
		imgCSize : [326, 326],
		imgDSize : [1120, 1120],
		gallerySize : [600, 380],
		items : [],
		esc : true,
		drag : true,
		fixedRange : true,
		//事件回调, before前缀 如果返回 false 则阻止 zoom
		onBeforeToB : _noop,
		onToB : _noop,
		onBeforeToC : _noop,
		onToC : _noop,
		onBeforeToD : _noop,
		onToD : _noop
	},
	ImgZoom = global.ImgZoom = function(ops){
		ops = ops || {};
		$.each(_ops, function(k, v){
			if(ops[k] === undefined){
				ops[k] = v;
			}
		});
		this.init(ops);
		ops.items.length > 0 && this.zoomToB(0);
	};
	ImgZoom.prototype = {
		constructor : ImgZoom,
		init : function(ops){
			this.shell = $(ops.shell);
			this.ops = ops;
			this.index = 0;
			if(!ops.fixedRange){
				this._rangeXY = function(x, y){ return [x, y];};
			}
			this.draw();
		},
		draw : function(){
			var 
			a, _t,
			self = this,
			ops = this.ops,
			ul = $('<ul />'),
			controllers = this.controllers = [],
			gallery = this.gallery = $('<div />').addClass('gallery'),
			controller = this.controller = $('<div />').addClass('controller'),
			closeBtn = this.closeBtn = $('<a />').attr({href:'javascript:void(0);'})
			.click(function(){
				self.zoomToB(self.index);
				return false;
			})
			.addClass('close').html('关闭');
			$.each(ops.items, function(i, item){
				a = $('<a />')
				.attr({
					hideFocus : true,
					title : item.title,
					href : ops.basePath + item.imgD
				})
				.click(function(){
					!self.animate && self.zoomToC($(this).data('inx'));
					return false;
				})
				.hover(function(){
					var a = this;
					global.clearTimeout(_t);
					_t = setTimeout(function(){
						!self.animate && self.level === 1 && self.zoomToB($(a).data('inx'));
					}, 240);
				}, function(){
					global.clearTimeout(_t);
				})
				.html('<img alt="" src="' + ops.basePath + item.imgA + '" width="' + ops.imgASize[0] + '" height="' + ops.imgASize[1] + '" />')
				.data('inx', i);
				item.loadCounter = 0;
				controllers.push(a);
				ul.append($('<li />').append(a));
			});
			this.shell.append(this.initGallery());
			this.shell.append(controller.append(ul));
			this.shell.append(closeBtn);
		},
		initGallery : function(){
			var 
			self = this,
			ops = this.ops,
			offsetX = 0,
			offsetY = 0,
			posXY = [0, 0],
			panelOffset = 0,
			img = this.img = $('<img />')
			.mousedown(function(e){
				if(self.level >= 3){
					var offset = img.offset();
					offsetX = e.pageX - offset.left;
					offsetY = e.pageY - offset.top;
					panelOffset = imgPanel.offset();
					self.draging = true;
				}
				e.preventDefault();
			})
			.attr({
				alt : '',
				width : ops.imgBSize[0],
				height : ops.imgBSize[1]
			}),
			imgMask = this.imgMask =  $('<img />')
			.mousedown(function(e){
				e.preventDefault();
			})
			.load(function(){
				!_cacheUrl[this.src] && ops.items[self.index].loadCounter++;
				!self.animate && self._fadeIn();
				_cacheUrl[this.src] = true;
			})
			.attr({
				alt : '',
				width : ops.imgDSize[0],
				height : ops.imgDSize[1]
			}),
			imgPanel = this.imgPanel = $('<div />').addClass('img_panel').hide().click(function(e){
				if(!self.animate && !self.dragLocked){
					self.level === 2 ? self.zoomToD(e.pageX, e.pageY) : self.zoomToC(self.index);
				}
				self.dragLocked = false;
				return false;
			}),
			maskPanel = this.maskPanel = $('<div />').addClass('img_panel').hide(),
			gallery = this.gallery = $('<div />').addClass('gallery');
			imgPanel.append(img);
			maskPanel.append(imgMask);
			//esc
			if(ops.esc){
				DOC.keydown(function(e){
					if(self.level > 1 && e.keyCode === 27){
						self[self.level !== 3 ? 'zoomToB' : 'zoomToC'](self.index);
					}
				});
			}
			//drag
			if(ops.drag){
				DOC.mousemove(function(e){
					if(self.draging){
						self.dragLocked = true;
						posXY = self._rangeXY(e.pageX - panelOffset.left - offsetX, e.pageY - panelOffset.top - offsetY);
						img.css({top : posXY[1], left : posXY[0]});
					}
					e.preventDefault();
				})
				.mouseup(function(e){
					self.draging = false;
				});
			}
			return gallery.append(imgPanel).append(maskPanel);
		},
		activeController : function(inx){
			this.controllers[this.index].removeClass('hover');
			this.controllers[(this.index = inx)].addClass('hover');
			return this;
		},
		_rangeXY : function(x, y){
			var ops = this.ops;
			//return [x, y];
			return [Math.min(0, Math.max(ops.gallerySize[0] - ops.imgDSize[0], x)), Math.min(0, Math.max(ops.gallerySize[1] - ops.imgDSize[1], y))];
		},
		_zoom : function(level, callback, x, y){
			var 
			self = this,
			ops = this.ops,
			levels = ['A', 'B', 'C', 'D'],
			size = ops['img' + levels[level] + 'Size'],
			css = false;
			if(ops['onBeforeTo' + levels[level]].call(this, this.index, level) !== false){
				css = {
					width : size[0],
					height : size[1],
					top : isFinite(y) ? y : (ops.gallerySize[1] - size[1]) / 2,
					left : isFinite(x) ? x : (ops.gallerySize[0] - size[0]) / 2
				};
				if(this.level !== level){
					this.animate = true;
					this.img.stop().animate(css, 400, function(){
						self.level = level;
						self.animate = false;
						self.imgPanel[0].className = 'img_panel img' + levels[level];
						$.type(callback) === 'function' && callback.call(self, css);
						ops['onTo' + levels[level]].call(self, self.index, level);
					});
				}
				else{
					ops['onTo' + levels[level]].call(this, this.index, level);
				}
			}
			return css;
		},
		_fadeIn : function(){
			var 
			self = this,
			item = this.ops.items[this.index];
			this.maskPanel.fadeIn(function(){
				self.img.attr('src', self.ops.basePath + item[self.level>2 ? 'imgD' : 'imgC']);
				self.maskPanel.hide();
			});
		},
		zoomToB : function(inx){
			var 
			ops = this.ops,
			item = ops.items[inx];
			if(this._zoom(1) === false) return this;
			this.img.attr('src', ops.basePath + item.imgB);
			this.imgPanel.fadeIn();
			this.activeController(inx);
		},
		zoomToC : function(inx){
			var 
			ops = this.ops,
			item = ops.items[inx],
			_callback = function(css){
				this.imgMask.css(css);
				item.loadCounter >= 1 && this._fadeIn();
			};
			if(this._zoom(2, _callback) === false) return this;
			this.imgMask.attr('src', ops.basePath + item.imgC);
			return this.activeController(inx);
		},
		zoomToD : function(x, y){
			if(!this.ops.onBeforeToD.call(this, this.index) === false) return this;
			var 
			img = this.img,
			ops = this.ops,
			size = ops.imgDSize,
			offset = img.offset(),
			position = img.position(),
			item = ops.items[this.index],
			ratio = [size[0]/ops.imgCSize[0] - 1, size[1]/ops.imgCSize[1] - 1],
			xy = this._rangeXY(position.left - (x - offset.left) * (ratio[0]), position.top - (y - offset.top) * (ratio[1])),
			_callback = function(css){
				this.imgMask.css(css);
				item.loadCounter >= 2 && this._fadeIn();
			};
			if(this._zoom(3, _callback, xy[0], xy[1]) === false) return this;
			this.imgMask.attr('src', ops.basePath + item.imgD);
			return this;
		}
	};
})(window, jQuery);