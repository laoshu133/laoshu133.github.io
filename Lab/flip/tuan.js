//ds.base
;(function(global, document, undefined){
	var 
	rblock = /\{([^\}]*)\}/g,
	ds = global.ds = {
		noop: function(){},
		//Object
		mix: function(target, source, cover){
			if(typeof source !== 'object'){
				cover = source;
				source = target;
				target = this;
			}
			for(var k in source){
				if(cover || target[k] === undefined){
					target[k] = source[k];
				}
			}
			return target;
		},
		//String
		mixStr: function(sStr){
			var args = Array.prototype.slice.call(arguments, 1);
			return String(sStr).replace(rblock, function(a, i){
				return args[i] != null ? args[i] : a;
			});
		},
		trim: function(str){
			return String(str).replace(/^\s*/, '').replace(/\s*$/, '');
		},
		//Number
		getRndNum: function(max, min){
			min = isFinite(min) ? min : 0;
			return Math.random() * ((isFinite(max) ? max : 1000) - min) + min;
		},
		//BOM
		scrollTo: (function(){
			var 
			duration = 480,
			view = $(global),
			setTop = function(top){ global.scrollTo(0, top);},
			fxEase = function(t){return (t*=2)<1?.5*t*t:.5*(1-(--t)*(t-2));};
			return function(top, callback){
				top = Math.max(0, ~~top);
				var 
				tMark = new Date(),
				currTop = view.scrollTop(),
				height = top - currTop,
				fx = function(){
					var tMap = new Date() - tMark;
					if(tMap >= duration){
						setTop(top);
						return (callback || ds.noop).call(ds, top);
					}
					setTop(currTop + height * fxEase(tMap/duration));
					setTimeout(fx, 16);
				};
				fx();
			};
		})(),
		//DOM
		loadScriptCache: {},
		loadScript: function(url, callback, args){
			var cache = this.loadScriptCache[url];
			if(!cache){
				cache = this.loadScriptCache[url] = {
					callbacks: [],
					url: url
				};

				var 
				firstScript = document.getElementsByTagName('script')[0],
				script = document.createElement('script');
				if(typeof args === 'object'){
					for(var k in args){
						script[k] = args[k];
					}
				}
				script.src = url;
				script.onload = script.onreadystatechange = 
				script.onerror = function(){
					if(/undefined|loaded|complete/.test(this.readyState)){
						script = script.onreadystatechange = 
						script.onload = script.onerror = null;
						cache.loaded = true;
						
						for(var i=0,len=cache.callbacks.length; i<len; i++){
							cache.callbacks[i].call(null, url);
						}
						cache.callbacks = [];
					}
				};
				firstScript.parentNode.insertBefore(script, firstScript);
			}

			if(!cache.loaded){
				if(typeof callback === 'function'){
					cache.callbacks.push(callback);
				}
			}
			else{
				(callback || ds.noop).call(null, url);
			}
			return this;
		},
		requestAnimationFrame: (function(){
			var handler = global.requestAnimationFrame || global.webkitRequestAnimationFrame || 
				global.mozRequestAnimationFrame || global.msRequestAnimationFrame || 
				global.oRequestAnimationFrame || function(callback){
					return global.setTimeout(callback, 1000 / 60);
				};
			return function(callback){
				return handler(callback);
			};
		})(),
		animate: (function(){
			var 
			easeOut = function(pos){ return (Math.pow((pos - 1), 3) + 1);};
			getCurrCSS = global.getComputedStyle ? function(elem, name){
				return global.getComputedStyle(elem, null)[name];
			} : function(elem, name){
				return elem.currentStyle[name];
			};
			return function(elem, name, to, duration, callback, easing){
				var 
				from = parseFloat(getCurrCSS(elem, name)) || 0,
				style = elem.style,
				tMark = new Date(),
				size = 0;
				function fx(){
					var elapsed = +new Date() - tMark;
					if(elapsed >= duration){
						style[name] = to + 'px';
						return (callback || ds.noop).call(elem);
					}
					style[name] = (from + size * easing(elapsed/duration)) + 'px';
					ds.requestAnimationFrame(fx);
				};
				to = parseFloat(to) || 0;
				duration = ~~duration || 200;
				easing = easing || easeOut;
				size = to - from;
				fx();
				return this;
			};
		})(),
		//Cookies
		getCookie: function(name){
			var ret = new RegExp('(?:^|[^;])' + name + '=([^;]+)').exec(document.cookie);
			return ret ? decodeURIComponent(ret[1]) : '';
		},
		setCookie: function(name, value, expir){
			var cookie = name + '=' + encodeURIComponent(value);
			if(expir !== void 0){
				var now = new Date();
				now.setDate(now.getDate() + ~~expir);
				cookie += '; expires=' + now.toGMTString();
			}
			document.cookie = cookie;
		},
		//Hacker
		transitionSupport: (function(){
			var 
			name = '',
			prefixs = ['', 'webkit', 'moz', 'ms', 'o'],
			docStyle = (document.documentElement || document.body).style;
			for(var i=0,len=prefixs.length; i<len; i++){
				name = prefixs[i] + (prefixs[i]!=='' ? 'Transition' : 'transition');
				if(name in docStyle){
					return {
						propName: name,
						prefix: prefixs[i]
					};
				}
			}
			return null;
		})(),
		isIE6: !-[1,] && !global.XMLHttpRequest
	};
})(this, document);

//团购
jQuery(function($){
	var 
	playing = false,
	shell = $('#home_tuan'),
	toggleBtn = shell.find('a.toggle'),
	panel = shell.find('.tuan_main'),
	tmpl = '<div class="item hide"><div class="timer" title="距离团购结束时间"><%=timeHTML%></div><a href="<%=href%>" class="pic" title="<%=title%>" target="_blank"><img src="<%=img%>" height="162" width="234" alt="<%=title%>" /><span class="price">团购价<em>&yen;<%=price%></em></span><span class="view">抢购</span></a></div>';

	var 
	items = [],
	prevInx = -1,
	playing = false;
	function play(shell, callback){
		if(playing){ return;}
		playing = true;

		var 
		width = 254,
		widthOffset = 18,
		height = 255,
		left = width,
		top = height,
		toggleWidth = 40,
		toggleMaxWidth = 340,
		style = shell[0].style,
		toggleStyle = toggleBtn[0].style,
		easing = function(pos){ return (Math.pow((pos - 1), 3) + 1);},
		duration = 520;
		
		var tMark = new Date(), toggleFadeing = false;
		function fx(){
			var per = ((+new Date()) - tMark) / duration;
			if(per >= 1){
				//style.clip = 'auto'; ie7- not supported auto
				style.clip = 'rect(0 264px 264px -20px)';
				playing = false;
				if(!toggleFadeing){
					restoreToggle();
				}
				callback();
				return;
			}
			per = easing(per);
			left = width - width * per - widthOffset;
			top = height - height * per;

			if(!toggleFadeing){
				if(toggleWidth >= toggleMaxWidth){
					toggleFadeing = true;
					restoreToggle();
				}
				else{
					//toggleWidth = 110 + height * per;
					toggleWidth = 410 * per;
					toggleStyle.height = toggleStyle.width = toggleWidth + 'px';
				}
			}
			style.clip = 'rect(' + [top, width-widthOffset, height, left].join('px ') + 'px)';
			
			ds.requestAnimationFrame(fx);
		}
		toggleStyle.display = 'block';
		fx();
	}
	function resetToggle(){
		toggleBtn.css({
			opacity: 1,
			height: 0,
			width: 0
		})
		.animate({
			height: 40,
			width: 40
		});
	}
	function restoreToggle(){
		if($.support.opacity){
			toggleBtn.stop().animate({opacity:0}, 240, resetToggle);
		}
		else{
			resetToggle();
		}
	}
	function showTuan(inx){
		if(playing){ return;}

		var shell = items[inx].shell;
		if(prevInx >= 0){
			items[prevInx].shell.css('zIndex', items.length);
		}
		shell.css({
			zIndex: items.length + 1,
			clip: 'rect(0 0 0 0)'
		})
		.show();
		play(shell, function(){
			if(prevInx >= 0){
				items[prevInx].shell.hide();
			}

			prevInx = inx;
		});
	}
	
	function initTuanHTML(list){
		var timeHTML, html = '';
		$.each(list, function(){
			this.timeStr = getTimeStr(this.timeout);
			this.timeHTML = this.timeStr.replace(/\w|:/g, function(a){
				return '<em class="n' + (a===':' ? 'n' : a) + '"></em>';
			});
			html += ds.tmpl(tmpl, this);
		});
		panel.html(html);
		items = list;
	}
	function initTuan(list){
		initTuanHTML(list);

		var shells = shell.find('div.item');
		$.each(items, function(i){
			this.index = i;
			this._timeStr = '';
			this.shell = shells.eq(i);
			this.numShells = this.shell.find('em:not(.nn)');

			var self = this, numShells = this.numShells;
			ds.startTimeout(self.timeout, function(queue, c){
				if(prevInx !== self.index || c % 2 !== 0){ return;}

				var tmpStr = getTimeStr(queue.remaining, '');
				if(tmpStr !== self._timeStr){
					numShells.each(function(i){
						if(tmpStr.charAt(i) !== self._timeStr.charAt(i)){
							playNum(numShells, i, ~~tmpStr.charAt(i), 48);
						}
					});
					self._timeStr = tmpStr;
				}
			}, function(){
				if(prevInx !== self.index){
					for(var i=6-1; i>=0; --i){
						playNum(numShells, i, 0, 48);
					}
				}
			});
		});

		var 
		img = new Image(),
		maskImg = ds.isIE6 ? 'tuan_mask_ie6.png' : 'tuan_mask.png';
		img.onload = function(){
			img.onload = null;

			toggleBtn.html('<img src="' + img.src + '" alt="" />');
			toggleBtn.bind('click', function(e){
				e.preventDefault();
				
				showTuan((prevInx+1) % items.length);
			});
			shell.hover(function(){
				if(!playing){
					toggleBtn.animate({height:56, width:56}, 200);
				}
			}, function(){
				if(!playing){
					toggleBtn.animate({height:40, width:40}, 200);
				}
			});
			showTuan(0);
		};
		img.src = 'images/' + maskImg;
	}
	
	//倒计时
	function getTimeStr(ms, split){
		var 
		s = ms / 1000,
		h = ~~(s / 3600),
		m = ~~((s - h*3600) / 60);
		s = ~~(s - (h*3600 + m*60));

		var arr = [h<10 ? '0'+h : h, m<10 ? '0'+m : m, s<10 ? '0'+s : s];
		return arr.join(split === void 0 ? ':' : split);
	}

	function getPos(num, frameInx, cInx){
		var 
		x = 0,
		y = -38 * (6 * num + frameInx),
		maxNum = [9, 9, 5, 9, 5, 9][cInx];
		if(num === 5 && num === maxNum){
			x = -19;
		}
		return [x, 'px ', y, 'px'].join('');
	}
	function playNum(numShells, inx, toNum, speed){
		var 
		timer, c = 0,
		style = numShells[inx % numShells.length].style;
		function fx(){
			style.backgroundPosition = getPos(toNum, c++, inx);
			if(c >= 6){
				return clearInterval(timer);
			}
		}
		timer = setInterval(fx, speed || 20);
	}
	
	ds.initTuanList = initTuan;
});

/**
* 倒计时
* 步长 100ms
* 2013.05.27
* kongge@office.weiphone.com
*/
ds.mix((function(){
	var timer, hasTimer = false, c = 0, queueList = [];
	function checkQueue(){
		timer = setTimeout(checkQueue, 100);
		if(!hasTimer){
			hasTimer = true;
			return;
		}

		c++;
		var queue, elapsed, tMark = +new Date();
		for(var i=0,len=queueList.length; i<len && (queue = queueList[i]); i++){
			elapsed = tMark - queue.startStamp;
			queue.remaining = queue.duration - elapsed;
			if(queue.remaining <= 0){
				len--;
				queueList.splice(i--, 1);
				queue.ondone.call(null, queue, c);
			}
			else{
				queue.onstep.call(null, queue, c);
			}
		}
		if(queueList.length <= 0){
			clearTimeout(timer);
			hasTimer = false;
		}
	}
	return {
		startTimeout: function(ms, onstep, ondone){
			var id = queueList.length + 1;
			queueList.push({
				id: id,
				duration: ~~ms,
				remaining: ~~ms,
				startStamp: +new Date(),
				onstep: onstep || this.noop,
				ondone: ondone || this.noop
			});
			checkQueue();
			return id;
		},
		stopTimeout: function(id){
			for(var i=0,len=queueList.length; i<len; i++){
				if(id === queueList[i].id){
					return queueList.splice(i, 1);
				}
			}
			return {};
		}
	};
})());

/**
* ds.tmpl.js
* create: 2013.01.10
* update: 2013.09.26
* admin@laoshu133.com
**/
;(function(global){var ds=global.ds||(global.ds={});var rarg1=/\$1/g,rgquote=/\\"/g,rbr=/([\r\n])/g,rchars=/(["\\])/g,rdbgstrich=/\\\\/g,rfuns=/<%\s*(\w+|.)([\s\S]*?)\s*%>/g,rbrhash={'10':'n','13':'r'},helpers={'=':{render:'__.push($1);'}};ds.tmpl=function(tmpl,data){var render=new Function('_data','var __=[];__.data=_data;'+'with(_data){__.push("'+tmpl.replace(rchars,'\\$1').replace(rfuns,function(a,key,body){body=body.replace(rbr,';').replace(rgquote,'"').replace(rdbgstrich,'\\');var helper=helpers[key],tmp=!helper?key+body:typeof helper.render==='function'?helper.render.call(ds,body,data):helper.render.replace(rarg1,body);return'");'+tmp+'__.push("';}).replace(rbr,function(a,b){return'\\'+(rbrhash[b.charCodeAt(0)]||b);})+'");}return __.join("");');return data?render.call(data,data):render;};ds.tmpl.helper=helpers;})(this);