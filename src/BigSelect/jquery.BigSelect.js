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

	/**
	 * 数据存储对象
	 */
	function DataSource(dataSet) {
		/**
		 * 数据集
		 */
		this.dataSet = dataSet || [];

		/**
		 * 设置来自select元素的数据集
		 */
		this.setDataSetFromSelect = function(selectObj) {
			var self = this;
			$.each(selectObj.find("option"), function(idx, elem) {
				self.dataSet[idx] = {
					k : $(elem).val(),
					v : $(elem).text()
				};
			});
		};
		/**
		 * 获取初始来自select元素的数据集
		 */
		this.getDataSetFromSelect = function(reg) {
			var matchDate = [];
			for (var i = 0; i < this.dataSet.length; i++) {
				var v = this.dataSet[i].v;
				if (reg.test(v)) {
					matchDate.push(this.dataSet[i]);
				}
			}
			return matchDate;
		};

		this.setDataSetFromArray = function(array) {
			for (var i = 0; i < array.length; i++) {
				this.dataSet[i] = {
					k : array[i],
					v : array[i]
				};
			}
		};
		this.getDataSetFromArray = function(reg) {
			var matchDate = [];
			for (var i = 0; i < this.dataSet.length; i++) {
				var v = this.dataSet[i].v;
				if (reg.test(v)) {
					matchDate.push(this.dataSet[i]);
				}
			}
			return matchDate;
		}
	}

	/**
	 * 分页对象
	 * @param {Number} pageSize 分页大小.默认一页20条数据
	 */
	function Page(pageSize) {
		/**
		 * 序列号
		 */
		this.serialVersionUID = +new Date();
		/**
		 * 默认分页大小
		 */
		this.DEFAULT_SIZE = pageSize || 20;
		/**
		 * 当前页
		 */
		this.CURRENT_PAGE = 1;
		/**
		 * 总记录数
		 */
		this.TOTAL_SIZE = 0;
		/**
		 * 总页数
		 */
		this.TOTAL_PAGE = 0;

		/**
		 * 分页数据
		 */
		this.data = [];

		/**
		 * 初始函数
		 */
		this.init = function(aData) {
			this.data = aData;
			this.TOTAL_SIZE = aData.length;
			this.TOTAL_PAGE = Math.ceil(this.TOTAL_SIZE / this.DEFAULT_SIZE);
			this.CURRENT_PAGE = 1;
		};
		/**
		 * 分页数据起始索引
		 */
		this.start = function() {
			return (this.CURRENT_PAGE - 1) * this.DEFAULT_SIZE;
		};
		/**
		 * 分页数据结束索引
		 */
		this.end = function() {
			return Math.min(this.TOTAL_SIZE, this.start() + this.DEFAULT_SIZE);
		};
		/**
		 * 下一页
		 */
		this.next = function() {
			if (this.CURRENT_PAGE != this.TOTAL_PAGE) {++this.CURRENT_PAGE;
				this.display();
			}

		};
		/**
		 * 上一页
		 */
		this.previous = function() {
			if (this.CURRENT_PAGE !== 1) {--this.CURRENT_PAGE;
				this.display();
			}
		};
		/**
		 * 首页
		 */
		this.first = function() {
			if (this.CURRENT_PAGE !== 1) {
				this.CURRENT_PAGE = 1;
				this.display();
			}
		};
		/**
		 * 末页
		 */
		this.last = function() {
			if (this.CURRENT_PAGE != this.TOTAL_PAGE) {
				this.CURRENT_PAGE = this.TOTAL_PAGE;
				this.display();
			}

		};
		/**
		 * 直接跳转
		 * @param {Number} page_num 页码
		 */
		this.jumpto = function(page_num) {
			if (page_num > 0 && page_num <= this.TOTAL_PAGE) {
				this.CURRENT_PAGE = parseInt(page_num);
				this.display();
			}
		};
		/**
		 * 显示数据及分页信息
		 */
		this.display = function() {
			showdata($("#bigSelect_content_" + this.serialVersionUID), this);
			showpage($("#bigSelect_page_" + this.serialVersionUID), this);
		};
	};
	/**
	 * 创建BigSelect框架
	 *
	 * @param {DataSource} dataSource 数据源对象
	 * @param {Page} page 分页对象
	 * @param {Object} options 可选参数
	 */
	function createBigSelectFrmDiv(dataSource, page, options) {

		var $bigSelect = $("<div>").addClass("bigSelect").attr("id", "bigSelect_" + page.serialVersionUID);

		var $search = $("<input type='search' autocomplete='off' />").addClass("bigSelect_search").attr("id", "bigSelect_search_" + page.serialVersionUID);

		$search.keyup(function() {
			var ipt = escapeRegex($.trim($(this).val()));
			var reg = new RegExp("^" + ipt, "i");
			page.init(dataSource["getDataSetFrom"+options.dataType](reg));
			page.display();
		});

		var $content = $("<div>").addClass("bigSelect_content").attr('id', "bigSelect_content_" + page.serialVersionUID);

		showdata($content, page);

		var $page = $("<div>").addClass("bigSelect_page").attr("id", "bigSelect_page_" + page.serialVersionUID);

		showpage($page, page);

		return $bigSelect.append($search).append($content).append($page);
	}

	/**
	 * 展示数据
	 *
	 * @param {Object} $dataPlacement 数据展示DOM位置
	 * @param {Page} page 分页对象
	 */
	function showdata($dataPlacement, page) {
		$dataPlacement.find('ul').detach();
		var $ul = $("<ul>");
		for (var i = page.start(); i < page.end(); i++) {
			var $li = $("<li>").attr("_val_", page.data[i].k).html(page.data[i].v);
			$li.click(function() {
				$("#data1").val($(this).attr("_val_"));
				setTimeout(function() {
					$("#bigSelect_" + page.serialVersionUID).hide("slow", function() {
						$(this).detach();
					});
				}, 10);
			});
			$ul.append($li);
		}
		$dataPlacement.append($ul);
	}

	/**
	 * 显示分页信息
	 *
	 * @param {Object} $page 分页显示DOM位置
	 */
	function showpage($pagePlacement, page) {
		//移除分页显示
		$pagePlacement.find("span").detach();

		$total = $("<span>共 " + page.TOTAL_SIZE + " 条数据 </span>");
		$pagePlacement.append($total);

		if (page.TOTAL_PAGE != 1) {
			//首页,上一页
			if (page.CURRENT_PAGE > 1) {
				var $first_span = $("<span>");
				var $first_link = $("<a href='javascript:void(0);' title='首页'>首页</a>");

				$first_link.click(function() {
					page.first();
				});

				$pagePlacement.append($first_span.append($first_link));

				var $pre_span = $("<span>");
				var $pre_link = $("<a href='javascript:void(0);' title='上一页'>上一页</a>");

				$pre_link.click(function() {
					page.previous();
				});

				$pagePlacement.append($pre_span.append($pre_link));
			}
			// 跳转输入
			var $jump_span = $("<span>第</span>");
			var $jump_input = $("<input type='text' maxlength='2' value='" + page.CURRENT_PAGE + "'/>");

			$jump_input.bind("keydown", function(event) {
				if (event.which == 13) {
					page.jumpto(this.value);
				}
			});
			var $jump = $jump_span.append($jump_input).append("/" + page.TOTAL_PAGE + "页");
			$pagePlacement.append($jump);

			//下一页 ,末页
			if (page.CURRENT_PAGE < page.TOTAL_PAGE) {
				var $next_span = $("<span>");
				var $next_link = $("<a href='javascript:void(0);' title='下一页'>下一页</a>");

				$next_link.click(function() {
					page.next();
				});

				$pagePlacement.append($next_span.append($next_link));

				var $last_span = $("<span>");
				var $last_link = $("<a href='javascript:void(0);' title='末页'>末页</a>");
				$last_link.click(function() {
					page.last();
				});
				$pagePlacement.append($last_span.append($last_link));
			}
		}
	}

	var Factory = {
		isExist : function() {

		},
		BigSelect : function(obj, options) {
			var opts = $.extend(true, {}, $.fn.bigSelect.defaults, options);

			var dataSource = new DataSource();
			dataSource["setDataSetFrom"+options.dataType](obj);

			var page = new Page(opts.pagesize);
			page.init(dataSource.dataSet);

			var $bigSel = createBigSelectFrmDiv(dataSource, page, opts);

			obj.after($bigSel);
		}
	}

	$.fn.bigSelect = function(ds, options) {
		var obj = this;
		var opts = $.extend(true, {}, $.fn.bigSelect.defaults, options);

		var dataSource = new DataSource();

		if (opts.dataType === 'Array') {
			dataSource.setDataSetFromArray(ds);
		} else {
			dataSource.setDataSetFromSelect(obj);
		}

		var page = new Page(opts.pagesize);
		page.init(dataSource.dataSet);

		var $bigSel = createBigSelectFrmDiv(dataSource, page, opts);

		obj.after($bigSel);
		// this.click(function() {
		// Factory.BigSelect(self, options);
		// });
	};

	$.fn.bigSelect.defaults = {
		pagesize : 20,
		dataType : 'Select'
	};
})(jQuery);
