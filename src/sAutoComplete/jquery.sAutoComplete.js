/*
 * jQuery1.4+
 */
(function($) {
	function escapeRegex(value) {
		return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	}

	// 包装div外壳
	function wrapDivShell(obj) {
		$(obj).wrap($("<div>").addClass('auto_div_shell'));
	}

	var $sAutoComplete = {
		hidnData : null,
		bindObj : null, // input element
		originData : [], // 数据源
		chooseData : [], // 选中的数据
		suggestData : [], // 建议匹配数据
		element : null, // 基于匹配数据的当前显示元素<ul><li>..</ul>
		active : null, // 当前选中的元素<li></li>
		options : null,
		init : function(obj, option) {
			this.bindObj = obj;
			this.options = option;
			obj.addClass('auto_input');
			wrapDivShell(obj);
			obj.css({
				width : option.css.width,
				height : option.css.height
			});
		},
		/**
		 * 清理suggest相关数据
		 */
		clearBaseData : function() {
			this.hidenData = null;
			this.suggestData = null;
			this.active = null;
		},
		setHidnData : function(data) {
			if (this.hidnData) {
				this.hidnData.val(data);
			}
		},
		setChooseData : function() {
			var k = this.active.attr('tabindex');
			var data = this.suggestData[k];
			this.chooseData = this.chooseData ? this.chooseData : [];
			this.chooseData[0] = data ? data : "";
		},
		/**
		 * 显示选中元素
		 */
		activate : function(event, item) {
			this.deactivate();
			if (this.hasScroll()) {
				// 显示元素相对于父元素的高度
				var offset = item.offset().top - this.element.offset().top;
				var scroll = this.element.scrollTop();
				var elementHeight = this.element.height();
				if (offset < 0) {
					this.element.scrollTop(scroll + offset);
				} else if (offset >= elementHeight - item.height()) {
					// 滚动过的高度+(显示元素高度-下拉框高度)+显示元素本身高度
					this.element.scrollTop(scroll + (offset - elementHeight) + item.height());
				}
			}
			this.active = item.eq(0).addClass('auto_selected_li');
			// 记录数据
			if (/^key/.test(event.type)) {
				this.setChooseData();
			}
		},

		deactivate : function() {
			if (!this.active) {
				return;
			}
			this.active.eq(0).removeClass('auto_selected_li');
			this.active = null;
		},
		/**
		 * 上下移动选中数据
		 *
		 * @param direct
		 *            移动方向 next|prev
		 * @param edge
		 *            当移动到边界时，下一个或者上一个数据选择器 ：last|:first
		 */
		move : function(direct, edge, event) {
			if (!this.element) {
				this.displaySuggestData();
				return;
			}
			if (!this.active) {
				this.activate(event, this.element.children(edge));
				return;
			}
			// 调用nextAll()/prevAll()方法
			var next = this.active[direct + "All"]().eq(0);
			if (next.length) {
				this.activate(event, next);
			} else {
				this.activate(event, this.element.children(edge));
			}
			this.selected();
		},
		/**
		 * 向下移动
		 */
		next : function(event) {
			this.move('next', ":first", event);
		},
		/**
		 * 向上移动
		 */
		previous : function(event) {
			this.move("prev", ":last", event);
		},
		selected : function() {
			if (this.active && this.active.eq(0)) {// 存在激活元素
				this.bindObj.val(this.active.eq(0).text());
				this.setChooseData();
				this.setHidnData(this.chooseData[0].k);
			} else {
				// 当前选择值不为空。适应选中后再次打开下拉，但未选择的情况
				if (!this.chooseData || !this.chooseData[0]) {
					this.setHidnData('');
				}
			}
		},
		// 滚动条
		hasScroll : function() {
			return this.element.height() < this.element[$.fn.prop ? "prop"
			: "attr"]("scrollHeight");
		},
		// 关闭搜索
		close : function() {
			if (this.element && this.element.is(":visible")) {
				this.selected();
				this.element.hide();
				this.clearBaseData();
			}
		},
		/**
		 * 建议查询
		 */
		suggest : function(val) {
			this.clearBaseData();
			$inval = escapeRegex(val);
			var reg = new RegExp("^" + $inval, "i");
			this.suggestData = [];
			for (var i = 0; i < this.originData.length; i++) {
				if (reg.test(this.originData[i].v)) {
					this.suggestData.push(this.originData[i]);
				}
			}
			return this;
		},
		// 显示匹配数据
		displaySuggestData : function() {
			var $ul = this.bindObj.find("~ul");
			if (!$ul || $ul.length == 0) {
				$ul = $("<ul>").css({
					width : this.options.css.width
				});
			}

			$ul.show();
			$ul.find("li").remove();

			var self = this;

			if (!this.suggestData || !this.suggestData.length === 0) {
				this.suggest('');
			}
			$.each(this.suggestData, function(idx, val) {
				var $li = $("<li>").attr('tabindex', idx).text(val.v);
				$li.bind("click", function() {
					self.close();
				}).mouseenter(function(event) {
					self.activate(event, $(this));
				}).mouseleave(function() {
					self.deactivate();
				});
				$ul.append($li);
				// 判断当前是否已有选中值
				if (self.chooseData && self.chooseData[0] && self.chooseData[0].k == val.k) {
					self.active = $li;
				}
			});
			this.element = $ul;
			this.bindObj.after($ul);

			if (this.active) {// 激活已经选择的项，并滚动到当前可见位置
				this.active.trigger('mouseenter');
			}

		}
	};

	$.fn.sAutoComplete = function(datasource, options) {

		if (!datasource) {
			return null;
		}

		var $autoComplete = $.extend(true, {}, $sAutoComplete);

		var opts = $.extend(true, {}, $.fn.sAutoComplete.defaults, options);

		$autoComplete.init(this, opts);

		if (opts.dataType === 'select') {
			$autoComplete.hidnData = datasource;
			$.each(datasource.find("option"), function(id, ele) {
				$autoComplete.originData[id] = {
					k : $.trim($(ele).val()),
					v : $.trim($(ele).text())
				};
			});

		}
		if (opts.dataType === 'json') {
			var idx = 0;
			$.each($.parseJSON(datasource), function(_k, _v) {
				$autoComplete.originData[idx++] = {
					k : _k,
					v : _v
				};
			});
		}
		if (opts.dataType === 'array') {
			for (var idx = 0; idx < datasource.length; idx++) {
				$autoComplete.originData[idx] = {
					k : idx,
					v : datasource[idx]
				};
			}
		}

		$autoComplete.suggestData = $autoComplete.originData;

		this.bind('click', function() {
			$autoComplete.displaySuggestData();
		});
		this.bind('foucs', function(event) {
			$autoComplete.suggest(this.value).displaySuggestData();
		});
		this.bind('blur', function() {
			setTimeout(function() {
				$autoComplete.close();
			}, 25);

		});
		this.bind("keyup", function(event) {
			switch (event.which) {
				case 9:
					// tab
					this.foucs
					break;
				case 13:
					// 回车
					$autoComplete.close();
					return false;
					break;
				case 38:
					// 向上
					$autoComplete.previous(event);
					break;
				case 40:
					// 向下
					$autoComplete.next(event);
					break;
				default:
					$autoComplete.suggest(this.value).displaySuggestData();
			}
		});

	};
	$.fn.sAutoComplete.defaults = {
		dataType : 'select',
		css : {
			width : 250,
			height : 30
		}
	};
})(jQuery);
