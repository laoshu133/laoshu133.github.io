//闪字
//author - 米
//laoshu133.com
//@param
//@items - 需要闪字的容器id， 可以为字符串 - "strId"，或者数组 - ['strId1', 'strId2']
//@delay - 每次闪烁间隔时间，单位毫秒，可选，默认 500
//@colors - 自定义颜色集，可选，默认 - ['#f00', '#217BAB', '#FF00FF', '#fc0', '#f0c']
//@fun - Blink.stopAuto - 停止文本闪烁
(function(window){
	var 
	doc = window.document,
	$d = function(id){ return typeof id === 'string' ? doc.getElementById(id) : id;},
	
	Blink = function(ops){
		for(var k in ops){
			this.ops[k] = ops[k];
		}
		this.init(this.ops);
		this.run();
	};
	Blink.prototype = {
		constructor : Blink,
		ops :{
			items : [],
			colors : ['#f00', '#217BAB', '#FF00FF', '#fc0', '#f0c'],
			delay : 500
		},
		init : function(ops){
			var items = typeof ops.items === 'string' ? [ops.items] : ops.items, styles = [];
			for(var i=0,len=items.length; i<len; i++){
				items[i] = $d(items[i]);
			}
			this.items = items;
		},
		setColor : function(color){
			var items = this.items;
			for(var i=0, len=items.length; i<len; i++){
					items[i].style.color = color;
			}
		},
		run : function(){
			var self = this, ops =this.ops,
			delay = ops.delay, colors = ops.colors,
			i = 0, len = colors.length, itemLen = this.items.length;
			this.timer = setInterval(function(){
				if(self.isAuto === false){
					clearTimeout(self.timer);
					return;
				}
				self.setColor(colors[i++%len]);
			}, delay);
		},
		stopAuto : function(){
			this.isAuto = false;
		}
	}
	//挂载在window
	window.Blink = Blink;
})(window);