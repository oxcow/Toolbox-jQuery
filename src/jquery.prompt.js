/*
 * jQuery Prompt Plugin 用来显示元素提示消息,相当于html中某些元素的的title属性
 *
 * @author: leeyee
 *
 * @requires jQuery v1.1.2 or later
 *
 *
 * prompt(title,options)带有两个参数。其中，
 *
 * title ： 显示内容或为jQuery选择器。当为jQuery选择器时，该插件将显示该选择器的html()元素内容
 *
 * options ： 主要用来设置该插件的显示样式。
 *
 */
(function($) {
	$.fn.prompt = function(title, options) {

		if ( title instanceof jQuery) {
			title = $(title).html();
		}

		var opts = $.extend(true, {}, $.fn.prompt.defaults, options);

		var $eid = this.attr('id');

		this.mouseenter(function(e) {

			$("#_title_" + $eid).detach();

			// 横向滚动条滚动过的距离
			var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
			// 竖向滚动条滚动过的距离
			var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

			var x = e.clientX + scrollLeft;
			// 实际坐标X点
			var y = e.clientY + scrollTop;
			// 实际坐标Y点
			// 判断当前元素位置是否插过浏览器窗口显示大小， 确保坐标点落在当前窗口区域，而非已滚动过的区域
			if (e.clientX + opts.css.width > document.documentElement.clientWidth) {
				x = Math.max(scrollLeft, x - opts.css.width - 6);
			}
			if (e.clientY + opts.css.height > document.documentElement.clientHeight) {
				y = Math.max(scrollTop, y - opts.css.height - 6);
			}

			var $div = $("<div id='_title_" + $eid + "'>").css({
				'z-index' : '1000',
				'position' : 'absolute',
				'border' : 'none',
				'border-radius' : '10px',
				'-moz-border-radius' : '10px',
				'-webkit-border-radius' : '10px',
				'box-shadow' : '5px 2px 6px #000',
				'-moz-box-shadow' : '5px 2px 6px #000',
				'-webkit-box-shadow' : '5px 2px 6px #000',
				'left' : x + 6,
				'top' : y + 6,
				'width' : opts.css.width,
				'height' : opts.css.height,
				'background-color' : opts.css.bgcolor,
				'opacity' : opts.css.opacity,
				'padding' : opts.css.padding
			}).addClass(opts.className);

			// 点击关闭提示消息
			$div.click(function() {
				$(this).detach();
			});

			$(this).css({
				'cursor' : 'pointer'
			}).after($div.append(title));
		});
		// 开启鼠标离开事件
		if (opts.openmouseleave) {
			this.mouseleave(function() {
				$("#_title_" + $eid).detach();
			});
		}
	};
	$.fn.prompt.defaults = {
		css : {
			width : 'auto',
			height : 'auto',
			bgcolor : '#FFFFCC',
			opacity : 0.8,
			padding : '8px 8px'
		},
		className : null,
		openmouseleave : true
	};
})(jQuery); 