var dsUrls = [
	{
		text:'图片切换',
		items:[
			{text:'百叶窗效果', url:'louver/'},
			{text:'水平堆叠切换', url:'stack_slider/'},
			{text:'卡片效果', url:'Slider/'},
			{text:'渐隐效果', url:'FadeList/'}
		]
	},
	{
		text:'导航效果',
		items:[
			{text:'QQ在线交谈', url:'qq/'},
			{text:'通用多级导航(JQ)', url:'multi_nav/'},
			{text:'机顶盒导航用', url:'slidebar/'},
			{text:'无图简单一级导航', url:'hover_nav/'},
		]
	},
	{
		text:'图片效果',
		items:[
			{text:'折角效果', url:'bend/'}
		]
	},
	{
		text : '文字效果',
		items :[
			{text:'文字闪烁', url:'blink/'}
		]
	},
	{
		text : '工具',
		items : [
			{text:'JS Tester', url:'tester/'}
		]
	},
	{
		text : '其他',
		items : [
			{text:'星级评分', url:'star_level/'},
			{text:'星级评分2', url:'star_level2/'}
		]
	},
	{
		text : '一些CSS',
		items : [
			{text:'兼容FF ellipsis', url:'css/text_ellipsis.html'},
			{text:'CSS Reset', url:'css/css_reset/'}
		]
	},
	{
		text : 'Study or Reference',
		items : [
			{text:'Tween', url:'tween/'},
			{text:'prototypeTween', url:'tween/prototype_tween.html'},
			{text:'colorist', url:'colorist/'},
			{text:'CSS3小图标', url:'css3_icon/'}
		]
	}
];
//--debug
dsUrls[2].items.splice(0,0,dsUrls[2]);
dsUrls[1].items.push(dsUrls[2]);
