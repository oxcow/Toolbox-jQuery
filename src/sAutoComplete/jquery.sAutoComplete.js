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
		// TODO need to modify var name
		datas : null,
		bindObj : null,
		// TODO add datasource. eg : xml、json etc.
		originData : [],// 数据源
		// 匹配数据
		matchData : [],
		// 基于匹配数据的当前显示元素<ul><li>..</ul>
		element : null,
		// 当前选中的元素<li></li>
		active : null,
		// 显示匹配数据
		displayMatchData : function() {
			this.bindObj.find("~ul").remove();
			var self = this;
			if (this.matchData.length !== 0) {
				var $ul = $("<ul>");
				$.each(this.matchData, function(idx, val) {
					var $li = $("<li>").attr('tabindex', idx).text(val.v);
					$li.bind("click", function() {
						self.close();
					}).mouseenter(function() {
						self.activate($(this));
					}).mouseleave(function() {
						self.deactivate();
					});
					$ul.append($li);
				});
				this.element = $ul;
				this.active = null;
				this.bindObj.after($ul);
			}
		},
		/**
		 * 显示选中元素
		 */
		activate : function(item) {
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
					this.element.scrollTop(scroll + (offset - elementHeight)
							+ item.height());
				}
			}
			this.active = item.eq(0).addClass('auto_selected_li');
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
			if (!this.active) {
				this.activate(this.element.children(edge));
				return;
			}
			// 调用nextAll()/prevAll()方法
			var next = this.active[direct + "All"]().eq(0);
			if (next.length) {
				this.activate(next);
			} else {
				this.activate(this.element.children(edge));
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
			if (this.active && this.active.eq(0)) {
				this.bindObj.val(this.active.eq(0).text());
				var id = parseInt(this.active.eq(0).attr('tabindex'));
				
				//TODO: need to fixed 
				this.datas.val(this.matchData[id].k);
			} else {
				this.datas.val('');
			}

		},
		/**
		 * 查询
		 */
		search : function() {
			var $inval = this.bindObj.val();
			$inval = escapeRegex($inval);
			var reg = new RegExp("^" + $inval, "i");
			this.matchData = [];
			for ( var i = 0; i < this.originData.length; i++) {
				if (reg.test(this.originData[i].v)) {
					this.matchData.push(this.originData[i]);
				}
			}
			return this;
		},
		// 滚动条
		hasScroll : function() {
			return this.element.height() < this.element[$.fn.prop ? "prop"
					: "attr"]("scrollHeight");
		},
		// 关闭搜索
		close : function() {
			this.selected();
			this.element.remove();
			this.deactivate();
		}
	};

	$.fn.sAutoComplete = function(datasource) {
		var $autoComplete = $.extend(true, {}, $sAutoComplete);

		$autoComplete.bindObj = this;

		this.addClass('auto_input');

		wrapDivShell(this);

		$autoComplete.datas = datasource;

		$.each(datasource.find("option"), function(id, ele) {
			// $autoComplete.originData[id] = new Object();
			// $autoComplete.originData[id].k = $.trim($(ele).val());
			// $autoComplete.originData[id].v = $.trim($(ele).text());
			$autoComplete.originData[id] = {
				k : $.trim($(ele).val()),
				v : $.trim($(ele).text())
			};
			$autoComplete.matchData = $autoComplete.originData;
		});

		this.bind('focus', function(event) {
			$autoComplete.displayMatchData();
		});
		this.bind('blur', function() {
			$autoComplete.close();
		});
		this.bind("keyup", function(event) {
			switch (event.which) {
			case 13:// 回车
				$autoComplete.close();
				break;
			case 38:// 向上
				$autoComplete.previous();
				break;
			case 40:// 向下
				$autoComplete.next();
				break;
			default:
				$autoComplete.search().displayMatchData();
			}
		});

	};

})(jQuery);