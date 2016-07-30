/*
author : laoshu133
update : 2011.08.20
www.laoshu133.com
--fix IE6 不能position:fixed的BUG
--最好不要设置背景图片，设置背景图片后，背景将无法滚动
--如果设置为右对齐， 请固定宽度， 下对齐，请固定高度
2011.09.29 --增加 setAbsolute, setStatic 方法
*/
;(function(window, doc){
	ds.mix({
		setFixed : function(elems){
			var 
			body = doc.body,
			isIE6 = this.ieVer(6),
			docElStr = '(document.documentElement || document.body)',
			el, style, pos;
			if(elems && elems.nodeType === 1){
				elems = [elems];
			}
			if(isIE6 && this.css(body, 'backgroundAttachment') !== 'fixed'){
				this.css(body, 'backgroundAttachment', 'fixed');
				this.css(body, 'backgroundImage') === 'none' && this.css(body, 'backgroundImage', 'url(about:blank)');
			}
			for(var i=0,len=elems.length; i<len; i++){
				el = this.$d(elems[i]);
				style = el.style;
				if(isIE6){
					style.position = 'absolute';
					pos = this.getPosition(el);
					style.setExpression('left', 'eval("' + docElStr + '.scrollLeft + ' + pos.left + '") + "px"');
					style.setExpression('top', 'eval("' + docElStr + '.scrollTop + ' + 0 + '") + "px"');
				}
				else{
					style.position = 'fixed';
				}
			}
			return this;
		}
	});
	var propFn = function(type){
		var	isIE6 = ds.ieVer(6);
		return function(elems){
			if(elems && elems.nodeType === 1){
				elems = [elems];
			}
			var style,
			i = 0, len = elems.length;
			for(; i<len; i++){
				style = elems[i].style;
				if(isIE6){
					style.removeExpression('left');
					style.removeExpression('top');
				}
				style.position = type;
			}
			return this;
		}
	};
	ds.each(['static', 'absolute'], function(i, k){
		ds['set' + ds.upperFirst(k)] = propFn(k);
	});
})(this, this.document);
