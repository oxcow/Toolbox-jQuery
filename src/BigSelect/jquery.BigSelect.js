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

	var SerialVersionUID = null;
	/**
	 * 数据存储对象
	 */
	var DataSource = {
		/**
		 * 数据集
		 */
		dataSet : [],
		/**
		 * 匹配数据
		 */
		matchData : [],
		/**
		 * 设置来自select元素的数据集
		 */
		setDataSetFromSelect : function(selectObj) {
			$.each(selectObj.find("option"), function(idx, elem) {
				DataSource.dataSet[idx] = {
					k : $(elem).val(),
					v : $(elem).text()
				};
			});
		}
	};

	function DataSource() {
		this.dataSet = [];
		this.matchDate = [];
		this.setDataSetFromSelect = function(selectObj) {
			$.each(selectObj.find("option"), function(idx, elem) {
				DataSource.dataSet[idx] = {
					k : $(elem).val(),
					v : $(elem).text()
				};
			});
		}
	}

	/**
	 * 分页对象
	 */
	var Page = {
		/**
		 * 默认分页大小
		 */
		DEFAULT_SIZE : 20,
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
			this.CURRENT_PAGE = 1;
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
		 * @param {Number} page_num 页码
		 */
		jumpto : function(page_num) {
			if (page_num > 0 && page_num <= this.TOTAL_PAGE) {
				this.CURRENT_PAGE = parseInt(page_num);
				this.display();
			}
		},
		/**
		 * 展示分页
		 */
		display : function() {
			showdata($("#bigSelect_content_" + SerialVersionUID));
			showpage($("#bigSelect_page_" + SerialVersionUID));
		}
	};
	/**
	 *	创建BigSelect框架
	 */
	function createBigSelectFrmDiv(options) {
		var $bigSelect = $("<div>").addClass("bigSelect").attr("id", "bigSelect_" + SerialVersionUID);

		var $search = $("<input type='search' autocomplete='off' />").addClass("bigSelect_search").attr("id", "bigSelect_search_" + SerialVersionUID);

		$search.keyup(function() {
			var ipt = escapeRegex($.trim($(this).val()));
			var reg = new RegExp("^" + ipt, "i");
			DataSource.matchData = [];
			for (var i = 0; i < DataSource.dataSet.length; i++) {
				var v = DataSource.dataSet[i].v;
				if (reg.test(v)) {
					DataSource.matchData.push(DataSource.dataSet[i]);
				}
			}
			Page.init(DataSource.matchData);
			Page.display();
		});

		var $content = $("<div>").addClass("bigSelect_content").attr('id', "bigSelect_content_" + SerialVersionUID);

		showdata($content);

		var $page = $("<div>").addClass("bigSelect_page").attr("id", "bigSelect_page_" + SerialVersionUID);

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


	$.fn.bigSelect = function(options) {

		var opts = $.extend(true, {}, $.fn.bigSelect.defaults, options);

		SerialVersionUID = this.attr('id') + +new Date();

		DataSource.setDataSetFromSelect(this);

		Page.init(DataSource.dataSet);

		var $bigSel = createBigSelectFrmDiv(opts);

		this.after($bigSel);

	};

	$.fn.bigSelect.defaults = {

	};
})(jQuery);
