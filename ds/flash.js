/*
author : laoshu133
update : 2011.05.20
www.laoshu133.com
--flash模块
*/
;(function(window, undefined){
	var _uid = 0,
	flashVer = (function(ds){
		var ver = 0, plg = navigator.plugins, obj = null, support = false,
		str='Shockwave Flash', ieStr = 'ShockwaveFlash.ShockwaveFlash.7';
		if(plg && plg[str]){
			obj = plg[str].description.split(' ');
			ver = parseInt(obj[2], 10);
		}
		else{
			try{
				obj = new ActiveXObject(ieStr);
				ver = parseInt(obj.GetVariable("$version").split(' ')[1], 10);
			}catch(_){}
		}
		return ver || 0;
	})();
	ds.mix({
		supportFlash : flashVer>0,
		flashVer : flashVer,
		getFlashHTML : function(url, width, height, id, ops){
			var 
			html,
			opts = [],
			isIE = ds.browser.IE,
			proPri = /^https/.test(location.href) ? 'https://' : 'http://',
			//默认参数
			_ops = {
				wmode : 'transparent',
				bgcolor : '#ffffff',
				allowFullScreen : 'false',
				allowScriptAccess : 'always',
				loop : 'false',
				menu : 'false',
				quality : 'best'
			};
			ops = ds.mix(ops || {}, _ops);
			for(var k in ops){
				opts.push(isIE ? '<param name="' + k + '" value="' + ops[k] + '" />' : (k + '="' + ops[k] + '" '));
			}
			id = id || 'ds_flash_' + _uid++;
			//<param name="flashvars" value="' + flashvars + '"/>
			html = isIE ? 
				'<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="' + 
				proPri + 'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="' + 
				width + '" height="' + height + '" id="' + id + '"><param name="movie" value="' + url + '" />' + 
				opts.join('') + '</object>' : 
				'<embed id="' + id + '" src="' + url + '" width="' + width + '" height="' + height + '" name="' + 
				id + '" type="application/x-shockwave-flash" pluginspage="' + 
				proPri + 'www.macromedia.com/go/getflashplayer" ' + opts.join('') + ' />';
			return html;
		}
	});
})(window);
