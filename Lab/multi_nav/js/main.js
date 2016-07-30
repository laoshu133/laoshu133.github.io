(function($){
	var nav = window.mNav = function(id, hand){
		var obj = $('#' + id), delay = 240,
		isOut = true, isIn = false,
		hands = {
			display : [function(){ this.show();}, function(){ this.hide();}], 
			show : [function(){ this.show(400);}, function(){ this.hide(400);}],
			fade : [function(){ this.fadeIn();}, function(){ this.fadeOut();}]
		},
		delayFn = function(fn){
			
		};
		hand = $.isArray(hand) ? hand : (!!hands[hand] ? hands[hand] : hands['display']);
		obj.find('li').hover(function(){
			var o = $(this),
			showUl = function(){
				if(o.data('isIn')){
					o.addClass('hover');
					$.isFunction(hand[0]) && hand[0].call(o.children('ul').eq(0));
				}
			};
			o.data('isIn', true);
			o.data('isOut', false);
			setTimeout(showUl, delay);
		},function(){
			var o =$(this), ul = o.children('ul').eq(0),
			hideUl = function(){
				var t,
				removeHover = function(){
					if(!ul.is(':visible')){
						o.removeClass('hover');
						clearTimeout(t);
						return;
					}
					t = setTimeout(removeHover, delay);
				};
				if(o.data('isOut')){
					$.isFunction(hand[1]) && hand[1].call(ul);
					removeHover();
				}
			};
			o.data('isOut', true);
			o.data('isIn', false);
			setTimeout(hideUl, delay);
		});
	}
})(jQuery);