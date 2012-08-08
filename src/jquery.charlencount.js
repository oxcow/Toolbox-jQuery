/*
 * jQuery jCharLenCount/jcharlencount Plugin 用来统计textarea/input[type=text]元素的输入字符数量
 *
 *
 * @author: leeyee
 * @requires jQuery v1.1.2 or later
 *
 * jCharLenCount(maxLen)带有一个参数.该参数用来定义该元素最大输入字符长度
 *
 *
 * maxLen可取以下值:
 *
 *  小于等于 0 : 该对象不允许输入. eg:jCharLenCount(0)
 * 	大于 0 : 该对象允许输入的最大字符数量，超过将只保留输入的[0,maxLen]个.eg:jCharLenCount(100)
 * 	等于 null : 只对该对象进行输入字符数量统计. eg:jCharLenCount(null)
 * 	未定义 : 只对该对象进行输入字符数量统计.eg:jCharLenCount()
 * 	字符串或者字符串数字 ： 提示非法输入，绑定失败. eg:jCharLenCount('test')
 *
 */
;
(function($) {
	$.fn.charLenCount = function(maxLen) {
		if ('string' === typeof (maxLen)) {
			alert('$("' + this.selector + '")绑定jCharLenCount方法失败(参数类型有误)');
			return;
		}
		
		// 负数一律当0来处理
		maxLen = maxLen >= 0 ? maxLen : 0;

		// 获取出示长度
		var init_char_len = countcharLen(this);

		// var opts = $.extend({}, $.fn.jcountchar.defaults, options);

		if (this.length == 0) {
			alert('$("' + this.selector + '")对象不存在.');
			return null;
		}

		// 得到绑定元素id
		var $eid = this.attr('id');
		if (!$eid) {
			alert('$("' + this.selector + '")对象id属性未定义.');
			return null;
		}

		$div_show = $("<div>").css({
			'clear' : 'both',
			'border-width' : '0px',
			'display' : 'inline'
		}).append(char_len_str(init_char_len, maxLen));

		var $m_t = this.css("margin-top");
		var $m_r = this.css("margin-right");
		var $m_b = this.css("margin-bottom");
		var $m_l = this.css("margin-left");
		this.css({
			"margin" : "0px 4px 0px 0px"
		});
		this.wrap($("<div>").css({
			'clear' : 'both',
			'border-width' : '0px',
			'display' : 'inline',
			'margin-top' : $m_t,
			'margin-right' : $m_r,
			'margin-bottom' : $m_b,
			'margin-left' : $m_l
		}));
		this.after($div_show);

		// 鼠标粘贴、剪贴事件
		$(this).bind("paste cut", function() {
			setTimeout("$('#" + $eid + "').trigger('keyup')", 5);
		});
		// 键盘释放事件
		$(this).bind("keyup", function() {
			var charnum = countcharLen(this);
			if ('number' === typeof (maxLen) && charnum > maxLen) {
				$(this).trigger("charLenOverflow");
				charnum = maxLen;
			}
			$(this).next("div").text(char_len_str(charnum, maxLen));
		});
		// 字符溢出事件
		$(this).bind("charLenOverflow", function() {
			charLenOverflowEvt(this, maxLen);
		});

		// 首次加载时要模拟出发keyup事件，避免默认值直接超出maxLen的情况出现
		$(this).trigger("keyup");
	};

	$.fn.charlencount = $.fn.charLenCount;

	// 默认字符溢出处理函数
	function charLenOverflowEvt(obj, maxLen) {
		$(obj).val($(obj).val().substring(0, maxLen));
		$(obj).next('div').text(maxLen);
	}

	// 统计当前字符长度
	function countcharLen(obj) {
		return $(obj).val() ? $(obj).val().length : 0;
	}

	function char_len_str(charLen, maxLen) {
		return maxLen === null || maxLen === undefined ? charLen : charLen + '/' + maxLen;
	}

})(jQuery);
