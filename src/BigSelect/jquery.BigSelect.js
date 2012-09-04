/**
 * jQuery BigSelect Plugin 用来批量显示下拉框元素。
 *
 * @author leeyee
 * @date 2012-09
 * @requires jQuery v1.1.2 or later
 *
 */
(function($) {
	function escapeRegex(value) {
		return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	}

	var Database = {
		//基本数据
		data : [],
		//过滤后的数据
		filterData : [],
	}
	/**
	 * 分页对象
	 */
	var Page = {
		/**
		 * 默认分页大小
		 */
		DEFAULT_SIZE : 10,
		/**
		 * 当前页
		 */
		CURRENT_PAGE : 1,
		/**
		 * 总记录数
		 */
		TOTAL_SIZE : 0,
		/**
		 * 总页数
		 */
		TOTAL_PAGE : 0,

		/**
		 * 分页数据
		 */
		data : [],

		/**
		 * 初始函数
		 */
		init : function(aData) {
			this.data = aData;
			this.TOTAL_SIZE = aData.length;
			this.TOTAL_PAGE = Math.ceil(this.TOTAL_SIZE / this.DEFAULT_SIZE);
			this.display();
		},
		/**
		 * 分页数据起始索引
		 */
		start : function() {
			return (this.CURRENT_PAGE - 1) * this.DEFAULT_SIZE;
		},
		/**
		 * 分页数据结束索引
		 */
		end : function() {
			return Math.min(this.TOTAL_SIZE, this.start() + this.DEFAULT_SIZE);
		},
		/**
		 * 下一页
		 */
		next : function() {
			if (this.CURRENT_PAGE != this.TOTAL_PAGE) {++this.CURRENT_PAGE;
				this.display();
			}

		},
		/**
		 * 上一页
		 */
		previous : function() {
			if (this.CURRENT_PAGE != 1) {--this.CURRENT_PAGE;
				this.display();
			}
		},
		/**
		 * 首页
		 */
		first : function() {
			if (this.CURRENT_PAGE != 1) {
				this.CURRENT_PAGE = 1;
				this.display();
			}
		},
		/**
		 * 末页
		 */
		last : function() {
			if (this.CURRENT_PAGE != this.TOTAL_PAGE) {
				this.CURRENT_PAGE = this.TOTAL_PAGE;
				this.display();
			}

		},
		/**
		 * 直接跳转
		 * @param {number} page_num 页码
		 */
		jumpto : function(page_num) {
			if (page_num >= this.CURRENT_PAGE && page_num <= this.TOTAL_PAGE) {
				this.CURRENT_PAGE = page_num;
				this.display();
			}
		},
		/**
		 * 展示分页
		 */
		display : function() {
			showdata($("#bigSelect_content"));
			showpage($("#bigSelect_page"));
		},
	};
	/**
	 *	创建BigSelect框架
	 */
	function createBigSelectFrmDiv() {
		var $bigSelect = $("<div>").attr("id", "bigSelect");

		var $search = $("<input type='search' autocomplete='off' />").attr("id", "bigSelect_search");

		$search.keyup(function() {
			var ipt = escapeRegex($(this).val());
			var reg = new RegExp("^" + ipt, "i");
			Database.filterData = [];
			for (var i = 0; i < Database.data.length; i++) {
				var v = Database.data[i].v;
				if (reg.test(v)) {
					Database.filterData.push(Database.data[i]);
				}
			}
			Page.init(Database.filterData);
		});

		var $content = $("<div>").attr('id', "bigSelect_content");

		showdata($content);

		var $page = $("<div>").attr("id", "bigSelect_page");

		showpage($page);

		return $bigSelect.append($search).append($content).append($page);
	}

	/**
	 * 展示数据
	 * @param {Object} $content 数据展示DOM位置
	 */
	function showdata($content) {
		$content.find('ul').detach();
		var $ul = $("<ul>");
		for (var i = Page.start(); i < Page.end(); i++) {
			var $li = $("<li>").attr("_val_", Page.data[i].k).html(Page.data[i].v).click(function() {
				$("#data1").val($(this).attr("_val_"));
			});
			$ul.append($li);
		}
		$content.append($ul);
	}

	/**
	 * 显示分页
	 * @param {Object} $page 分页显示DOM位置
	 */
	function showpage($page) {
		//移除分页显示
		$page.find("span").detach();

		$total = $("<span>共 " + Page.TOTAL_SIZE + " 条数据 </span>");
		$page.append($total);

		if (Page.TOTAL_PAGE != 1) {
			if (Page.CURRENT_PAGE > 1) {
				var $first_span = $("<span>");
				var $first_link = $("<a href='javascript:void(0);' title='首页'>首页</a>");

				$first_link.click(function() {
					Page.first();
				});

				$page.append($first_span.append($first_link));

				var $pre_span = $("<span>");
				var $pre_link = $("<a href='javascript:void(0);' title='上一页'>上一页</a>");
				$pre_link.click(function() {
					Page.previous();
				});

				$page.append($pre_span.append($pre_link));
			}
			var $jump_span = $("<span>第</span>");
			var $jump_input = $("<input type='text' maxlength='2' value='" + Page.CURRENT_PAGE + "'/>");

			$jump_input.bind("keydown", function(event) {
				if (event.which == 13) {
					Page.jumpto(this.value);
				}
			});

			var $jump = $jump_span.append($jump_input).append("/" + Page.TOTAL_PAGE + "页");

			$page.append($jump);

			if (Page.CURRENT_PAGE < Page.TOTAL_PAGE) {

				var $next_span = $("<span>");
				var $next_link = $("<a href='javascript:void(0);' title='下一页'>下一页</a>");

				$next_link.click(function() {
					Page.next();
				});

				$page.append($next_span.append($next_link));

				var $last_span = $("<span>");
				var $last_link = $("<a href='javascript:void(0);' title='末页'>末页</a>");
				$last_link.click(function() {
					Page.last();
				});

				$page.append($last_span.append($last_link));
			}
		}

	}


	$.fn.bigSelect = function() {

		$.each(this.find("option"), function(idx, elem) {
			Database.data[idx] = {
				k : $(elem).val(),
				v : $(elem).text()
			};
		});

		Page.init(Database.data);

		var $bigSel = createBigSelectFrmDiv();

		this.after($bigSel);
	}
})(jQuery);
