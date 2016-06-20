/**
* 威锋线下活动抽奖基础
* author _米[admin@laoshu133.com]
* create 2012.05
* update 2012.08.17
*/
;(function(global, document, undefined){
	//base
	var 
	rblock = /\{([^\}]*)\}/ig,
	ds = global.ds = {
		_noop : function(){},
		//Object
		mix : function(target, source, cover){
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
		each : function(target, callback){
			var i = 0, l = target.length;
			if(typeof l === 'number' && target.hasOwnProperty('length')){
				for(; i<l; i++){
					if(callback.call(target[i], i, target[i]) === false){
						return this;
					}
				}
			}
			else{
				for(i in target){
					if(callback.call(target[i], i, target[i]) === false){
						return this;
					}
				}
			}
			return this;
		},
		//String
		mixStr : function(sStr){
			var args = Array.prototype.slice.call(arguments, 1);
			return sStr.replace(rblock, function(a, i){
				return args[i] != null ? args[i] : a;
			});
		},
		//DOM
		$d : function(id){ return document.getElementById(id);},
		$D : function(selector, context){ return (context || document).querySelectorAll(selector);},
		//Events
		on : function(elem, type, handler){
			elem.addEventListener(type, handler, false);
			return this;
		},
		un : function(elem, type, handler){
			elem.removeEventListener(type, handler, false);
			return this;
		}
	};
	//extend AJAX --only XMLHttpRequest
	ds.mix((function(){
		var 
		_uuid = 0,
		head = document.head || document.getElementsByTagName('head')[0],
		_defOps = {
			
		};
		return {
			uuid : function(){ return _uuid++;},
			getXHR : function(){
				return new XMLHttpRequest();
			},
			ajax : function(ops){
				ops = ds.mix(ops || {}, _defOps);
			},
			loadScript : function(url, callback, args){
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.async = true;
				script.src = url;
				typeof args === 'object' && ds.mix(script, args);
				script.onload = function(){
					(callback || ds._noop).call(this);
				}
				head.insertBefore(script, head.firstChild);
			},
			getJSON : function(url, callback, args){
				var name = '_ds_jsonp_callback_' + this.uuid();
				url = url.indexOf('=?') > -1 ? url.replace('=?', '=' + name) : url + (url.indexOf('?') > -1 ? '&' : '?') + 'callback=' + name;
				global[name] = function(data){
					global[name] = null;
					(callback || ds._noop).call(data, data);
				};
				return ds.loadScript(url);
			}
		};
	})());
	//extend css, animate
	ds.mix((function(){
		var 
		easeInOutCubic = function(pos){ return (pos/=.5) < 1 ? .5*Math.pow(pos, 3) : .5*(Math.pow(pos-2, 3)+2);},
		numberCSS = ['zIndex', 'opacity'].join(',') + ',',
		rcamels = /-([a-zA-Z])/g,
		getCurrStyle = function(elem, ops){
			var curr, ret = {};
			ds.each(ops, function(k){
				curr = elem.ownerDocument.defaultView.getComputedStyle(elem, null)[k];
				if(isFinite(parseFloat(curr))){
					curr = parseFloat(curr);
					ret[k] = [curr, parseFloat(ops[k]) - curr];
				}
				else{
					ret[k] = [curr, ops[k]];
				}
			});
			return ret;
		};
		return {
			toCamels : function(str){
				return str.replace(rcamels, function(a, b){ return b.toUpperCase();});
			},
			css : function(elem, name, val){
				if(!elem || !elem.style) return this;
				if(typeof name === 'object'){
					return this.each(name, function(k, val){
						ds.css(elem, k, val);
					});
				}
				name = this.toCamels(name);
				if(val === undefined){
					return elem.ownerDocument.defaultView.getComputedStyle(elem, null)[name];
				}
				val += typeof val !== 'number' || numberCSS.indexOf(name + ',') > -1 ? '' : 'px';
				elem.style[name] = val;
				return this;
			},
			animate : function(elem, ops, duration, callback, ease){
				if(!elem || !elem.style) return this;
				ease = ease || easeInOutCubic;
				duration = isFinite(duration) ? duration : 200;
				var 
				_t, tMark,
				style = elem.style,
				fxOps = getCurrStyle(elem, ops),
				fx = function(){
					var now = new Date();
					if(now - tMark >= duration){
						ds.css(elem, ops);
						(callback || ds._noop).call(elem);
						return this;
					}
					var per = ease((now - tMark) / duration);
					ds.each(fxOps, function(k){
						style[k] = this[0] + per * this[1] + (numberCSS.indexOf(k+',') > -1 ? '' : 'px');
					});
					_t = setTimeout(fx, 16);
				};
				//filter String Property
				this.each(fxOps, function(k){
					if(0/this[1] !== 0){
						//style[k] = ops[k];
						delete fxOps[k];
					}
				});
				//fx
				tMark = new Date();
				fx();
				return this;
			},
			show : function(el, display){ return this.css(el, 'display', display || 'block');},
			hide : function(el, display){ return this.css(el, 'display', 'none');},
			fadeIn : function(el, duration, callback){
				return ds.css(el, {display:'block', opacity:0}).animate(el, {opacity:1}, duration, callback);
			},
			fadeOut : function(el, duration, callback){
				return this.css(el, {display:'block'}).animate(el, {opacity:0}, duration, function(){ ds.css(el, 'display', 'none'); (callback || ds._noop).call(el);});
			}
		};
	})());
	//extend Transform
	ds.mix((function(){
		var 
		pri = '',
		supportTransform = false, 
		style = document.documentElement.style,
		pris = ['O', 'ms', 'Moz', 'webkit', ''],
		i = pris.length;
		for(; i>=0; i--){
			if(pris[i] + 'Transform' in style){
				supportTransform = true;
				pri = pris[i];
				break;
			}
		}
		return {
			//css3 zoom
			transformPri : pri,
			supportTransform : supportTransform,
			setZoom : function(elem, zoom, x, y){
				elem.style[pri + 'Transform'] = 'scale(' + zoom + ') translate(' + (isFinite(x) ? x : 0) + 'px, ' + (isFinite(y) ? y : 0) + 'px)';
				return this;
			},
			setRotate : function(elem, deg, dir){
				elem.style[pri + 'Transform'] = 'rotate' + (dir || '') + '(' + deg + 'deg)';
				return this;
			}
		};
	})());
})(this, this.document);

/**
* 威锋线下活动抽奖系统
* author _米[admin@laoshu133.com]
* create 2012.05
* update 2012.08.17
*/
;(function(global, document, undefined){
	/**
	* 获取用户列表模块
	* 全局配置： currLevel - 当前抽几等奖, baseUrl - 全局数据基础URL
	*/
	ds.lotteryLevel = global.currLevel || 1;
	ds.baseUrl = global.baseUrl || 'http://act.weiphone.com/meet/';
	
	/**
	* 私有属性
	*/
	var 
	_baseUrl = ds.baseUrl,
	_currLevel = ds.lotteryLevel,
	dataUrl = _baseUrl + (global.getUsersUrl || 'index.php?r=json/getMeetUser&callback=?'),
	winUsersUrl = _baseUrl + (global.getWinersUrls || 'index.php?r=json/winList&t=2&callback=?'),
	addWinUserUrl = _baseUrl + (global.addWinerUrl || 'index.php?r=json/winner&callback=x&t=2&p=' + _currLevel + '&u=');
	
	/**
	* 扩展获取用户列表方法 & 添加获奖用户方法
	*/
	ds.mix({
		winList : [],
		userList : [],
		userHash : {},
		allUserHash : {},
		addUser : function(id, user){
			if(!this.allUserHash['user_' + id]){
				this.userList.push(id);
				this.allUserHash['user_' + id] = user;
			}
		},
		addWinUser : function(id, report){
			this.winList.push(id);
			if(!!report){
				var div, ifa = this._addWinIfa;
				if(!ifa){
					ifa = this._addWinIfa = document.createElement('iframe');
					div = document.createElement('div');
					ds.css(div, {height:0, width:0, overflow:'hidden', position:'absolute'});
					div.appendChild(ifa);
					document.body.appendChild(div);
				}
				ifa.src = addWinUserUrl + id;
			}
		},
		getUserById : function(id){
			return this.allUserHash['user_' + id];
		},
		makeUserHash : function(users){
			var winList = this.winList, userHash = this.userHash;
			this.each(ds.userList, function(i, id){
				if(winList.indexOf(id) < 0){
					userHash['user_' + id] = id;
				}
			});
			return userHash;
		},
		getUserList : function(callback){
			return ds.getJSON(winUsersUrl, function(data){
				ds.each(data, function(i){
					ds.addUser(this.user_id, this);
					ds.addWinUser(this.user_id);
				});
				ds.getJSON(dataUrl, function(users){
					ds.each(users, function(){
						ds.addUser(this.user_id, this);
					});
					(callback || ds._noop).call(this, ds.makeUserHash(), ds.userList, ds.winList);
				});
			});
			return this;
		}
	});
	
	/**
	* 扩展摇奖方法 Roll
	*/
	ds.mix((function(){
		var 
		_ops = {
			shell : null,
			unitSize : 100,
			maxTop : 1000,
			speedUp : 1000,
			speedUpDuration : 1000,
			getSpeedUpTop : function(pos){ return -this.speedUp * Math.pow(pos, 4);},
			speedDown : 1000,
			speedDownDuration : 1000,
			getSpeedDownTop : function(pos){ return this.speedDown * Math.pow(1 - pos, 4) - this.speedDown;},// var size = 0.6 * this.speedDown * Math.pow(1 - pos, 3); return this.speedDown - size;},
			//Events
			onstart : ds._noop,
			onchange : ds._noop,
			onspeedmax : ds._noop,
			onstop : ds._noop,
			onfinish : ds._noop
		},
		Roll = function(ops){
			this.init(ds.mix(ops || {}, _ops));
		};
		Roll.prototype = {
			constructor : Roll,
			init : function(ops){
				this.ops = ops;
				this.shell = ops.shell;
				this.maxTop = ops.maxTop;
				this.speedUp = ops.speedUp;
				this.unitSize = ops.unitSize;
				this.speedUpDuration = ops.speedUpDuration;
				this.speedDown = ops.speedDown;
				this.speedDownDuration = ops.speedDownDuration;
			},
			setMaxTop : function(top){ this.maxTop = this.ops.maxTop = top;},
			getRealTop : function(top){ return top - parseInt(top/this.maxTop) * this.maxTop;},
			status : 0,	//0 - init, 1 - speedUp, 2 - speddLinear, 3 - speedDown
			start : function(){
				if(this.status !== 0) return this;
				var 
				self = this,
				ops = this.ops,
				style = this.shell.style,
				currTop = this.top = parseFloat(ds.css(this.shell, 'top')),
				
				top = currTop,
				realTop = top,
				linearSpeed = 60,
				speedUp = this.speedUp,
				speedUpDuration = ops.speedUpDuration,
				_getTop = ops.getSpeedUpTop,
				fx = function(){
					var now = new Date(), per = (now - tMark) / speedUpDuration;
					if(self.status > 2) return;
					if(self.status === 2){
						top = self.top = top + linearSpeed;
					}
					else{
						top = currTop + _getTop.call(self, per);
						if(top <= currTop - speedUp){
							self.status = 2;
							linearSpeed = self.linearSpeed = top - self.top;
							ops.onspeedmax.call(self, linearSpeed, top);
						}
						self.top = top;
					}
					realTop = self.getRealTop(top);
					style.top = realTop + 'px';
					ops.onchange.call(self, top, realTop);
					self.timer = setTimeout(fx, 16);
				},
				tMark = new Date();
				this.status = 1;
				ops.onstart.call(this, top);
				fx();
				return this;
			},
			stop : function(){
				if(this.status !== 2) return this;
				global.clearTimeout(this.timer);
				this.status = 3;
				var 
				self = this,
				ops = this.ops,
				style = this.shell.style,
				
				currTop = Math.round(this.top / ops.unitSize) * ops.unitSize,
				top = currTop,
				realTop = top,
				speedDown = this.speedDown,
				speedDownDuration = ops.speedDownDuration,
				_getTop = ops.getSpeedDownTop,
				fx = function(){
					var now = new Date(), per = (now - tMark) / speedDownDuration;
					if(self.status !== 3) return;
					if(per >= 1){
						self.status = 0;
						clearTimeout(self.timer);
						top = Math.round((currTop - speedDown) / ops.unitSize) * ops.unitSize;
						realTop = self.getRealTop(top);
						style.top = realTop + 'px';
						return ops.onfinish.call(self, top, realTop);
					}
					top = self.top = currTop + _getTop.call(self, per);
					realTop = self.getRealTop(top);
					style.top = realTop + 'px';
					ops.onchange.call(self, top, realTop);
					return self.timer = setTimeout(fx, 16);
				},
				tMark = new Date();
				ops.onstop.call(this, top);
				fx();
				return this;
			}
		};
		return {Roll: Roll};
	})());
})(this, this.document);


/**
* 威锋线下活动抽奖系统 页面 Controller
* author _米[admin@laoshu133.com]
* create 2012.05
* update 2012.08.17
*/
;(function(global, document, undefined){	
	/*
	* 初始化 页面元素
	*/
	var 
	winCountElem = ds.$d('win_count'),
	onlineCountElem = ds.$d('online_count'),
	loading = ds.$d('loading'),
	userTmpl = '<li id="{0}_{1}">{2}</li>',
	userUl = ds.$d('user_list'),
	cloneUl = ds.$d('user_list_clone'),
	cloneUlStyle = cloneUl.style,
	winTmpl = '<li{2}><span>{0}</span><strong>{1}</strong></li>',
	winUl = ds.$d('win_list'),
	winUser = ds.$d('win_user'),
	speedState = ds.$D('.dot_panel i')[0],
	btn = ds.$D('.start_btn')[0],
	btnState = ds.$D('span', btn)[0],
	tmpUl = document.createElement('ul');
	
	/*
	* 初始化 抽奖数据
	*/
	var 
	winCount = 0,
	_maxLevel = 3,
	_currLevel = ds.lotteryLevel;
	
	/*
	* 初始化 抽奖回调
	*/
	var rollCallbackDone = true;
	/** 
	* 场内抽奖 rollCallback
	*/
	ds.rollCallbackInner = function(item, elem, top, realTop){
		var roll = this;
		rollCallbackDone = false;
		elem.style.opacity = 0;
		winUser.innerHTML = '[' + item.join_num + ']' + item.user_name;
		winUser.style.display = 'block';
		cloneUlStyle.display = 'none';
		ds.animate(winUser, {
			top : -38,
			left : 860,
			fontSize : 24
		}, 800, function(){
			this.style.cssText = '';
			winCountElem.innerHTML = winCount;
			roll.setMaxTop(roll.maxTop - roll.unitSize);
			ds.animate(elem, {height:0}, 400, function(){
				var idPre = this.id.replace(/\_\d$/, '_'), inx = parseInt(this.id.replace(idPre, ''), 10);
				userUl.removeChild(ds.$d(idPre + '0'));
				userUl.removeChild(ds.$d(idPre + '1'));
				//Fix The Last BUG
				if(parseInt(this.id.replace(idPre, ''), 10) === 1){
					var lis = ds.$D('li', userUl);
					userUl.insertBefore(lis[lis.length - 1], userUl.firstChild);
				}
				cloneUl.innerHTML = userUl.innerHTML;
				cloneUlStyle.display = 'block';
				rollCallbackDone = true;
			});
		});
		
		//Insert To WinUl
		var _tmpLi, winUlLis = ds.$D('li', winUl);
		tmpUl.innerHTML = ds.mixStr(winTmpl, ++winCount, '[' + item.join_num + ']' + item.user_name, ' style="opacity:0; height:0"');
		_tmpLi = ds.$D('li', tmpUl)[0];
		if(winUlLis.length > 1){
			winUl.insertBefore(_tmpLi, winUlLis[1]);
		}
		else{
			winUl.appendChild(_tmpLi);
		}
		ds.addWinUser(item.user_id, true);
		setTimeout(function(){ winUl.scrollTop = 0; ds.animate(_tmpLi, {height:38, opacity:1}, 300);}, 500);
		
		//Debug
		ds.log('[场内]Roll callback : elem = ', elem, ', name = ', item.user_name, ', realTop = ', realTop);
	};
	/** 
	* 场外抽奖 rollCallback
	*/
	ds.rollCallbackOuter = function(item, elem, top, realTop){
		var roll = this;
		rollCallbackDone = false;
		elem.style.opacity = 0;
		winUser.innerHTML = item.user_name;
		winUser.style.display = 'block';
		cloneUlStyle.display = 'none';
		ds.animate(winUser, {
			top : -78,
			left : 820,
			fontSize : 24
		}, 800, function(){
			this.style.cssText = '';
			winCountElem.innerHTML = winCount;
			roll.setMaxTop(roll.maxTop - roll.unitSize);
			ds.animate(elem, {height:0}, 400, function(){
				var idPre = this.id.replace(/\_\d$/, '_'), inx = parseInt(this.id.replace(idPre, ''), 10);
				userUl.removeChild(ds.$d(idPre + '0'));
				userUl.removeChild(ds.$d(idPre + '1'));
				//Fix The Last BUG
				if(parseInt(this.id.replace(idPre, ''), 10) === 1){
					var lis = ds.$D('li', userUl);
					userUl.insertBefore(lis[lis.length - 1], userUl.firstChild);
				}
				cloneUl.innerHTML = userUl.innerHTML;
				cloneUlStyle.display = 'block';
				rollCallbackDone = true;
			});
		});
		if(!winUl.firstChild){
			winUl.innerHTML = ds.mixStr(winTmpl, ++winCount, item.user_name, ' style="opacity:0; height:0"');
		}
		else{
			tmpUl.innerHTML = ds.mixStr(winTmpl, ++winCount, item.user_name, ' style="opacity:0; height:0"');
			winUl.insertBefore(tmpUl.firstChild, winUl.firstChild);
		}
		ds.addWinUser(item.user_id, true);
		setTimeout(function(){ winUl.scrollTop = 0; ds.animate(winUl.firstChild, {height:38, opacity:1}, 300);}, 500);
		
		//Debug
		ds.log('[场外]Roll callback : elem = ', elem, ', name = ', item.user_name, ', realTop = ', realTop);
	};
	
	/*
	* 初始化 抽奖系统
	*/
	var 
	rollCallback = ds.rollCallbackInner,
	lotteryType = global.lotteryType || 'inner';
	if(lotteryType === 'outer'){
		rollCallback = ds.rollCallbackOuter;
		ds.addUser = function(id, user){
			!this.allUserHash['user_' + id] && this.userList.push(id);
			this.allUserHash['user_' + id] = user;
		};
	}
	ds.show(loading);
	ds.getUserList(function(userHash, userList, winList){
		setTimeout(function(){ ds.fadeOut(loading, 720);}, 500);
		//init UserList
		var user, listHTML = [], listClone = [];
		/*
		* 场内
		*/
		if(lotteryType !== 'outer'){
			ds.each(userHash, function(k, id){
				user = ds.getUserById(id.replace('user_', ''));
				listHTML.push(ds.mixStr(userTmpl, k, '0', '[' + user.join_num + ']' + user.user_name));
				listClone.push(ds.mixStr(userTmpl, k, '1', '[' + user.join_num + ']' + user.user_name));
			});
			onlineCountElem.innerHTML = userList.length;
			cloneUl.innerHTML = userUl.innerHTML = listHTML.join('') + listClone.join('');
			
			//init WinList
			;(function(){
				var 
				user, list = [], prevType = _maxLevel,
				types = ['一等奖(1)', '二等奖(3)', '三等奖(5)', '安慰奖', '参与奖'];
				for(var c=0, i=winList.length-1; i>=0; i--){
					user = ds.getUserById(winList[i]);
					if(prevType !== parseInt(user.awards, 10)){
						list.push(ds.mixStr(winTmpl, '<em>' + types[prevType - 1] + '</em>', '', ' class="type"'));
						prevType = parseInt(user.awards, 10);
					}
					list.push(ds.mixStr(winTmpl, ++c, '[' + user.join_num + ']' + user.user_name, ''));
				}
				prevType > 0 && list.push(ds.mixStr(winTmpl, '<em>' + types[prevType - 1] + '</em>', '', ' class="type"'));
				_currLevel < prevType && list.push(ds.mixStr(winTmpl, '<em>' + types[_currLevel - 1] + '</em>', '', ' class="type"'));
				winCountElem.innerHTML = winCount = winList.length;
				winUl.innerHTML = list.reverse().join('');
			})();
		}
		/*
		* 场外
		*/
		else{
			ds.each(userHash, function(k, id){
				user = ds.getUserById(id.replace('user_', ''));
				listHTML.push(ds.mixStr(userTmpl, k, '0', user.user_name));
				listClone.push(ds.mixStr(userTmpl, k, '1', user.user_name));
			});
			onlineCountElem.innerHTML = userList.length;
			cloneUl.innerHTML = userUl.innerHTML = listHTML.join('') + listClone.join('');
			//init WinList
			listHTML.length = 0;
			for(winCount = -1; ++winCount < winList.length;){
				user = ds.getUserById(winList[winCount]);
				listHTML[winCount] = ds.mixStr(winTmpl, winCount+1, user.user_name, '');
			}
			winCountElem.innerHTML = winCount;
			winUl.innerHTML = listHTML.reverse().join('');
		}
		
		//Init Roll
		var 
		setCount = 0,
		dotChangeCount = 0,
		readFire = true,
		unitSize = 120,
		userCount = ds.$D('li', userUl).length/2,
		roll = global.roll = new ds.Roll({
			shell : userUl,
			unitSize : unitSize,
			maxTop : userUl.offsetHeight / 2,
			speedUp : unitSize * parseInt(userCount * 0.6),
			speedUpDuration : 2400,
			speedDown : unitSize * parseInt(userCount * 0.7),
			speedDownDuration : 3600,
			onstart : function(top){
				//btnState.className = 's2';
				setCount = dotChangeCount = 0;
				//ds.log('in Start, top = ', top);
			},
			onchange : function(top, realTop){
				//ds.log('change, top = ', top, ', realTop = ', realTop);
				cloneUlStyle.top = realTop + 'px';
				if(setCount % 18 === 0){
					speedState.className = 'p' + (dotChangeCount++ % 3);
				}
				setCount++;
			},
			onspeedmax : function(speed){
				btnState.className = 's2';
				//ds.log('init MaxSpeed, maxSpeed = ', speed);
			},
			//onstop : function(top){ ds.log('in Stop, top = ', top);},
			onfinish : function(top, realTop){
				btnState.className = '';
				cloneUlStyle.top = realTop + 'px';
				var 
				elem = ds.$D('li', userUl)[-parseInt(realTop / unitSize, 10) + 1],
				item = ds.getUserById(ds.userHash[elem.id.slice(0, elem.id.lastIndexOf('_'))]);
				rollCallback.call(this, item, elem, top, realTop);
			}
		}),
		startRoll = function(){
			readFire && rollCallbackDone && roll[roll.status === 0 ? 'start' : 'stop']();
			readFire = false;
		};
		//init Event
		//ds.on(btn, 'click', startRoll)
		ds.on(document, 'keydown', function(e){
			readFire = false;
			if(e.keyCode === 13 || e.keyCode === 32){
				if(roll.status === 0 || roll.status === 2){
					readFire = true;
					btnState.className = roll.status === 0 ? 's1' : 's3';
				}
				e.preventDefault();
			}
		})
		.on(document, 'keyup', function(e){
			readFire && (e.keyCode === 13 || e.keyCode === 32) && startRoll();
		});
	});
})(this, this.document);

/**
* 威锋线下活动抽奖系统 Debug 模块
* author _米[admin@laoshu133.com]
* create 2012.08.17
* update 2012.08.17
*/
;(function(global, document, undefined){
	/**
	* 扩展 ds.log
	* 抽奖系统调试模块
	*/
	ds.mix({
		log : function(){
			if(global.console){
				typeof console.log === 'object' ? Function.prototype.bind.call(console.log, console).apply(console, arguments) : console.log.apply(console, arguments);
			}
		}
	});
	
	/**
	* 抽奖系统调试模块
	*/
	var debug = !!global.lotteryDebug;
	if(debug){
		global.baseUrl = 'http://192.168.9.166:8081/meet/';
		ds.addWinUser = function(id, report){
			this.winList.push(id);
			ds.log('add Winer, id = ', id, ', isRport = ', !!report);
		};
	}
	else{
		ds.log = function(){};
	}
})(this, this.document);