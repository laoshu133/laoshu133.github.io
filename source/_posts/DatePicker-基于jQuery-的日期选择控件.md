---
title: DatePicker - 基于jQuery 的日期选择控件
tags:
  - Javascript
date: 2012-07-30 14:30:58
---

前不久因为公司活动需求，需要一个简单的日期选择控件，而且时效性不是很短，所以不想去用 jQuery UI 那样笨重的日期选择插件，于是就有了今天这篇：

首先从需求角度出发，我们对日期要求不高，比如不要求一定要有明确的星期几，不要求有明确的用户输入日期；但是要求：

1.  体积够小，速度够快

2.  高度可定制性，配置参数完善

于是，我打算不用图片处理界面，采用CSS3降级处理，单文件，HTML模板和CSS采用动态注入的方式。

完整代码（16KB）：[jquery.DatePicker.js(未压缩)](/Lab/DatePicker/jquery.DatePicker.js)，完善的[配置参数](/Lab/DatePicker/#all_option)

完整DEMO地址：[DatePicker](/Lab/DatePicker/)

一个简单DEMO：

<input type="text" id="date_picker_demo" value="2012-12-12" />
<script type="text/javascript">
window.onload = function() {
    $.getScript('/Lab/DatePicker/jquery.DatePicker.js', function() {
        $('#date_picker_demo').datePicker({
            followOffset: [0, 24]
        })
        .focus();
    });
};
</script>

```javascript
window.onload = function(){
	$.getScript('/Lab/DatePicker/jquery.DatePicker.js', function(){
		$('#date_picker_demo').datePicker({
			followOffset : [0, 24]
		})
		.focus();
	});
}
```

其实，说小那是相对于 jQuery UI 那样的笨重的插件来说的，本来以为不用多少代码就可以搞定了，没想到写着写着就 16KB 了。
