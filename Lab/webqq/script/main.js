$(document).ready(
	function(){
		var out_x=0,out_y=0,cur_obj='',z=0,c=0;
		var m_down;	//为窗口拖动的拖动函数绑定一个变量
		var tmp_obj=[];		//用于暂存临时对象
		$("#list h3").click(
			function(){
				var c=$(this).css('backgroundImage').indexOf('right')!=-1?true:false;
				var bg=c?'url(images/list_bottom_bg.png)':'url(images/list_right_bg.png)';
				$(this).css({backgroundImage:bg});
				var sta=c?$(this).parent().find('dl').show():$(this).parent().find('dl').hide();
			}
		);
		$("#list dl dd").dblclick(
			function(e){
				this.selected=false;
				this.focus=false;

				/*检查窗口是否已经打开*/			
				var h2s=new Array();
				$(".room h2").each(function(n){h2s[n]=$(this).html();}); //目前暂时采用标题判断是否已打开，后台开发后采用唯一ID判断
				 //判断窗口是否已经打开，如果则至于顶层

				for(var i=0; i<h2s.length; i++){/*$("#rooms ul").eq(i).css({opacity:0.8});*/if(h2s[i]==$(this).html()){if($("#rooms ul").eq(i).css("zIndex")<z) $("#rooms ul").eq(i).mousedown();$(document).mouseup();return false;}}
				/*很纳闷为什么我拆开写就不行
				for(var i=0; i<h2s.length; i++){
					/*$("#rooms ul").eq(i).css({opacity:0.8});
					if(h2s[i]==$(this).html()){
						if($("#rooms ul").eq(i).css("zIndex")<z){
							$("#rooms ul").eq(i).css({zIndex:++z,opacity:1});  //判断窗口是否已经打开，如果则至于顶层
							return false;
						}
					}
				}*/
				


				
			

				/*产生一个新的窗口，并对变量z自增，使窗口能拖动*/
				var tmp_z=1,tmp=0;
				
				$("#rooms ul").each(function(n){if($(this).css("zIndex")>tmp){tmp=$(this).css("zIndex");tmp_z=this.id}});
				$("#rooms").append('<ul class="room" id="room'+ ++z+'" style="z-index:'+z+';left:'+(z>1?Number($("#"+tmp_z).offset().left+10):150)+'px;top:'+(z>1?Number($("#"+tmp_z).offset().top+30):50)+'px;"><li class="header"><span class="right"><a href="#" class="room_min">--</a> <a href="#" class="room_max">口</a> <a href="#" class="close">X</a></span><h2>'+$(this).html()+'</h2></li><li class="content">内容加载中...</li><li class="tool"><span class="left"><a href="#" title="字体">字体</a></span><span class="left"><a href="#" title="">表情</a></span><span class="right"><a href="#" title="">聊天记录</a></span></li><li class="edit"></li><li class="footer"><span><a href="#" class="close">关闭</a></span><a href="#">发送</a></li></ul>');
				$("#min_rooms .min_room").each(function(){$(this).css({border:1})}); //重置所有的小窗口
				$("#min_rooms").append('<a id="room'+z+'_min" class="min_room" title=" '+$(this).html()+' "></a>');
				$(".header a,.tool a,.footer a").click(function(){return false;}); //关闭多余的a的动作
				$(".content,.edit,.header a,.tool a,.footer a").mousedown(function(){return false;}); //关闭内容和编辑栏以及a上的拖动
				$("#rooms .close").click(
					function(){
						tmp_obj=$(this).parent().parent().parent();
						tmp_obj.fadeOut('normal',function(){tmp_obj.remove();});
						$("#"+tmp_obj[0].id+"_min").remove();
					}
				);
				$("#rooms li h2").dblclick(function(){$(this).parent().find("a").eq(1).click();});
				$("#rooms .room_max").each(function(){
					$(this).click(
						function(e){
							//是否在顶层
							if($(this).css('zIndex')<z){$(this).parent().parent().mousedown();$(document).mouseup();};
							var s=new ss();
							tmp_obj=$(e.target).parent().parent().parent();
							if((s.width-30)>tmp_obj.innerWidth()){
								//alert('此功能目前尚待界面开发');
								var tmp_l=tmp_obj.css('left'),tmp_t=tmp_obj.css('top');
								tmp_obj.animate({left:6,top:6,width:(s.width-30),height:(s.height-20)},'normal');
								//alert(tmp_obj.find('li').eq(1).html());
								tmp_obj.find('li').eq(1).animate({height:(s.height-tmp_obj.find('li').eq(0).height()-tmp_obj.find('li').eq(2).height()-tmp_obj.find('li').eq(3).height()-70)+'px'});
								tmp_obj.unbind('mousedown',m_down);	//解除窗口拖动的绑定
							}else{
								//alert(m_down.callee());
								tmp_obj.animate({left:30,top:30,width:520,height:400},'normal');
								tmp_obj.find('li').eq(1).css({height:200});
								tmp_obj.bind('mousedown',m_down);	//绑定窗口拖动
							}
							return false;
						}
					);
				});
				
				$("#rooms .room_min").click(
					function(){
						tmp_obj=$(this).parent().parent().parent(),tmp_w=tmp_obj.css("width"),tmp_h=tmp_obj.css("height"),tmp_l=tmp_obj.css("left"),tmp_t=tmp_obj.css("top");
						//alert($("#"+tmp_obj.get(0).id+"_min").offset().top);
						tmp_obj.animate({top:$("#"+tmp_obj.get(0).id+"_min").offset().top,left:$("#"+tmp_obj.get(0).id+"_min").offset().left,width:42,height:42,opacity:0},'noamal','',function(){$(this).hide();$(this).css({width:tmp_w,height:tmp_h,top:tmp_t,left:tmp_l,opacity:1});});
					}
				);
				$("#min_rooms .min_room").click(
					function(){
						//alert("#"+this.id.substring(0,this.id.indexOf('_min'))+$("#"+this.id.substring(0,this.id.indexOf('_min'))).css('display'));
						tmp_obj=$("#"+this.id.substring(0,this.id.indexOf('_min')));
						//if(tmp_obj.css('display')!='block'){
							tmp_obj.fadeIn('normal');
							tmp_obj.mousedown();$(document).mouseup();
						//}else{
							//tmp_obj.find('li').eq(0).find('a').eq(0).click();
							return false;
						//}
						
					}
				);
				//为每个窗口(ul)绑定拖动事件
				$("#rooms ul").each(function(){
					$(this).mousedown(
						m_down=function(e){
							cur_obj=$(this);
							if(isIE) cur_obj.get(0).setCapture(); //兼容IE
							if(cur_obj.css("zIndex")<z){ $("#rooms .room").each(function(){$(this).css({opacity:0.8});cur_obj.css({zIndex:++z,opacity:1});$('#'+this.id+'_min').css({opacity:0.8,border:'1px solid #060'});$('#'+cur_obj.get(0).id+'_min').css({opacity:1,border:'3px solid #060'});});} //使其至于顶层
							out_x=Number(e.pageX-cur_obj.offset().left);
							out_y=Number(e.pageY-cur_obj.offset().top);
							e.stopPropagation();
						}
					);
				});
			

			}
		);
		$(document).mousemove(
			function(e){
				var cur_str='',el=e.target||e.srcElement,tmp_w,tmp_h;
				if (el.className == "room") {
					el=$(el);
					tmp_w=el.innerWidth();
					tmp_h=el.innerHeight();
					if (e.pageY-parseInt(el.css('top')) > (el.innerHeight())-5) cur_str += "s";
				    	if (e.pageX-parseInt(el.css('left'))> (el.innerWidth())-5) cur_str += "e";
					if (cur_str == "") cur_str = "default";else cur_str += "-resize";
					el.css('cursor',cur_str);
			  	}

				if(typeof(cur_obj)=='object' && e.which==1){
				//if(typeof(cur_obj)=='object' && e.which==1){
					
					var x,y;
					if(false || cur_str!='' && cur_str!='default'){


						/*
						x=(e.pageX-parseInt(el.css('left')));
						y=(e.pageY-parseInt(el.css('top')));

						
						cur_obj.css({width:x,height:y});*/
					}else{
						x=(e.pageX-out_x);
						y=(e.pageY-out_y);

						/*以下为JQ方法改变当前窗口的位置(全采用JQ的方法高度在IE8里面会出问题,宽度在IE6里面会出现问题)*/
						//x=x>3?x<($(document).width()-cur_obj.outerWidth(true)-3)?x:($(document).width()-cur_obj.outerWidth(true)-3):3;
						//y=y>3?y<($(document).height()-cur_obj.outerHeight(true)-3)?y:($(document).height()-cur_obj.outerHeight(true)-3):3;
					
						/*以下为JS方法改变当前窗口的位置*/
						var s=new ss();
						x=x>3?x<(s.width-cur_obj.outerWidth(true)-3)?x:(s.width-cur_obj.outerWidth(true)-3):3;
						y=y>3?y<(s.height-cur_obj.outerHeight(true)-3)?y:(s.height-cur_obj.outerHeight(true)-3):3;

						cur_obj.css({left:x,top:y});
					}

				}
			}
		).mouseup(
			function(){
				if(typeof(cur_obj)=='object'){
					//cur_obj.css({cursor:'default'});
					if(isIE) cur_obj.get(0).releaseCapture(); //兼容IE
					cur_obj='';
				}
			}
		);
		/*此处待删除*/
		$("#rooms ul").mousedown(
			function downx(e){
				cur_obj=$(this);
				out_x=Number(e.pageX-cur_obj.offset().left);
				out_y=Number(e.pageY-cur_obj.offset().top);
				e.stopPropagation();
			}
		);

	}
);

/*
function disableSelection(target){
if (typeof target.onselectstart!="undefined") //IE route
	target.onselectstart=function(){return false}
else if (typeof target.style.MozUserSelect!="undefined") //Firefox route
	target.style.MozUserSelect="none"
else  All other route (ie: Opera)
	target.onmousedown=function(){return false}
target.style.cursor = "default"
}
*/

