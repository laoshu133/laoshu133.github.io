(function(){
	ds.$D = ds.$D || function(tag, context){ return (context || document).getElementsByTagName(tag);};
	var
	scripts = ds.$D('script'),
	self = scripts[scripts.length - 1],
	urlPri = self.src.slice(0, self.src.lastIndexOf('/') + 1) + 'ds.lighter/',
	pres = ds.$D('pre'),
	rword = /[^, ]+/g,
	urls = [urlPri + 'sh_main.min.js'],
	oneObj = {};
	for(var i=0,len=pres.length; i<len; i++){
		pres[i].className.replace(rword, function(name){
			if(name.slice(0, 3) === 'sh_' && !oneObj[(name = name.slice(3))]){
				urls.push(urlPri + 'lang/sh_' + name + '.min.js');
				oneObj[name] = '_米空格';
			}
		});
	}
	ds.loadStyle(urlPri + 'style.css').loadScript(urls, function(){sh_highlightDocument();});
})();