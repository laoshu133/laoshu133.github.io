---
title: grunt-css-sprite
tags:
  - Javascript
date: 2014-06-22 21:21:41
---

<div class="markdown-here-wrapper" data-md-url="http://www.laoshu133.com/admin/admin_default.asp" style="">

这是一个帮助前端开发工程师将css代码中的切片合并成雪碧图的工具；
其灵感来源 `grunt-sprite`，由于其配置参数限制目录结构等，不能满足通用项目需求，现重新造轮子发布；
它的主要功能是：

1.  对css文件进行处理，收集切片序列，生成雪碧图
2.  在原css代码中为切片添加`background-position`属性
3.  生成用于高清设备的高清雪碧图，并在css文件末尾追加媒体查询代码
4.  支持 `image-set` 配置高清雪碧图
5.  在引用雪碧图的位置打上时间戳
6.  在样式末尾追加时间戳
7.  按照时间戳命名文件

### 使用 &amp; 帮助更新

NPM: [https://www.npmjs.org/package/grunt-css-sprite](https://www.npmjs.org/package/grunt-css-sprite)
Github: [https://github.com/laoshu133/grunt-css-sprite/](https://github.com/laoshu133/grunt-css-sprite/)
<div title="MDH:PHA+6L+Z5piv5LiA5Liq5biu5Yqp5YmN56uv5byA5Y+R5bel56iL5biI5bCGY3Nz5Luj56CB5Lit55qE5YiH54mH5ZCI5bm25oiQ6Zuq56Kn5Zu+55qE5bel5YW377ybPC9wPjxwPuWFtueBteaEn+adpea6kCBgZ3J1bnQtc3ByaXRlYO+8jOeUseS6juWFtumFjee9ruWPguaVsOmZkOWItuebruW9lee7k+aehOetie+8jOS4jeiDvea7oei2s+mAmueUqOmhueebrumcgOaxgu+8jOeOsOmHjeaWsOmAoOi9ruWtkOWPkeW4g++8mzwvcD48cD7lroPnmoTkuLvopoHlip/og73mmK/vvJo8L3A+PHA+PGJyPjwvcD48cD4xLiDlr7ljc3Pmlofku7bov5vooYzlpITnkIbvvIzmlLbpm4bliIfniYfluo/liJfvvIznlJ/miJDpm6rnoqflm748L3A+PHA+Mi4g5Zyo5Y6fY3Nz5Luj56CB5Lit5Li65YiH54mH5re75YqgYGJhY2tncm91bmQtcG9zaXRpb25g5bGe5oCnPC9wPjxwPjMuIOeUn+aIkOeUqOS6jumrmOa4heiuvuWkh+eahOmrmOa4hembqueip+Wbvu+8jOW5tuWcqGNzc+aWh+S7tuacq+Wwvui/veWKoOWqkuS9k+afpeivouS7o+eggTwvcD48cD40LiDmlK/mjIEgYGltYWdlLXNldGAg6YWN572u6auY5riF6Zuq56Kn5Zu+PC9wPjxwPjQuIOWcqOW8leeUqOmbqueip+WbvueahOS9jee9ruaJk+S4iuaXtumXtOaIszwvcD48cD41LiDlnKjmoLflvI/mnKvlsL7ov73liqDml7bpl7TmiLM8L3A+PHA+Ni4g5oyJ54Wn5pe26Ze05oiz5ZG95ZCN5paH5Lu2PC9wPjxwPjxiciB0eXBlPSJfbW96Ij48L3A+PHA+IyMjIOS9v+eUqCAmYW1wOyDluK7liqnmm7TmlrA8L3A+PHA+TlBNOiZuYnNwO2h0dHBzOi8vd3d3Lm5wbWpzLm9yZy9wYWNrYWdlL2dydW50LWNzcy1zcHJpdGU8L3A+PHA+R2l0aHViOiZuYnNwO2h0dHBzOi8vZ2l0aHViLmNvbS9sYW9zaHUxMzMvZ3J1bnQtY3NzLXNwcml0ZS88L3A+PHA+PC9wPg==" style="height:0;font-size:0em;padding:0;margin:0;">​</div></div>