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
	function Page() {
		/**
		 * 序列号
		 */
		this.serialVersionUID = +new Date();
		/**
		 * 默认分页大小
		 */
		this.DEFAULT_SIZE = 20;
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
		this.init = function(aData, pageSize) {
			this.data = aData;
			this.DEFAULT_SIZE = pageSize || this.DEFAULT_SIZE;
			this.TOTAL_SIZE = aData.length;
			this.TOTAL_PAGE = Math.ceil(this.TOTAL_SIZE / this.DEFAULT_SIZE);
			this.CURRENT_PAGE = 1;
			return this;
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
			if (this.CURRENT_PAGE != this.TOTAL_PAGE)
				++this.CURRENT_PAGE;
		};
		/**
		 * 上一页
		 */
		this.previous = function() {
			if (this.CURRENT_PAGE !== 1)
				--this.CURRENT_PAGE;
		};
		/**
		 * 首页
		 */
		this.first = function() {
			if (this.CURRENT_PAGE !== 1)
				this.CURRENT_PAGE = 1;
		};
		/**
		 * 末页
		 */
		this.last = function() {
			if (this.CURRENT_PAGE !== this.TOTAL_PAGE)
				this.CURRENT_PAGE = this.TOTAL_PAGE;
		};
		/**
		 * 直接跳转
		 * @param {Number} page_num 页码
		 */
		this.jumpto = function(page_num) {
			if (page_num > 0 && page_num <= this.TOTAL_PAGE)
				this.CURRENT_PAGE = parseInt(page_num);
		};
		/**
		 * 显示分页数据
		 *
		 * @param {BigSelectFrame} bigSelectFrame BigSelect HTML框架对象
		 */
		this.showPagedata = function(bigSelectFrame) {
			$dataPlacement = $("#" + bigSelectFrame.bigSelectContentId);
			$dataPlacement.find('ul').detach();
			var $ul = $("<ul>");
			for (var i = this.start(); i < this.end(); i++) {
				var $li = $("<li>").attr("_val_", this.data[i].k).html(this.data[i].v);
				$li.click(function() {
					$("#data1").val($(this).attr("_val_"));
					setTimeout(function() {
						$("#" + bigSelectFrame.bigSelectId).hide("slow", function() {
							$(this).detach();
						});
					}, 10);
				});
				$ul.append($li);
			}
			$dataPlacement.append($ul);
		};

		/**
		 * 显示分页工具条
		 *
		 * @param {BigSelectFrame} bigSelectFrame BigSelect HTML框架对象
		 */
		this.pageToolbar = function(bigSelectFrame) {

			var parent = this;

			var $offsetObj = $("#" + bigSelectFrame.bigSelectPageId);

			//移除已有的分页工具条
			$offsetObj.find("span").detach();

			$total = $("<span>共 " + this.TOTAL_SIZE + " 条数据 </span>");
			$offsetObj.append($total);

			if (this.TOTAL_PAGE != 1) {
				//首页,上一页
				if (this.CURRENT_PAGE > 1) {
					var $first_span = $("<span>");
					var $first_link = $("<a href='javascript:void(0);' title='首页'>首页</a>");

					$first_link.click(function() {
						parent.first();
						bigSelectFrame.display(parent);
					});

					$offsetObj.append($first_span.append($first_link));

					var $pre_span = $("<span>");
					var $pre_link = $("<a href='javascript:void(0);' title='上一页'>上一页</a>");

					$pre_link.click(function() {
						parent.previous();
						bigSelectFrame.display(parent);
					});

					$offsetObj.append($pre_span.append($pre_link));
				}
				// 跳转输入
				var $jump_span = $("<span>第</span>");
				var $jump_input = $("<input type='text' maxlength='2' value='" + this.CURRENT_PAGE + "'/>");

				$jump_input.bind("keydown", function(event) {
					if (event.which == 13) {
						parent.jumpto(this.value);
						bigSelectFrame.display(parent);
					}
				});
				var $jump = $jump_span.append($jump_input).append("/" + this.TOTAL_PAGE + "页");
				$offsetObj.append($jump);

				//下一页 ,末页
				if (this.CURRENT_PAGE < this.TOTAL_PAGE) {
					var $next_span = $("<span>");
					var $next_link = $("<a href='javascript:void(0);' title='下一页'>下一页</a>");

					$next_link.click(function() {
						parent.next();
						bigSelectFrame.display(parent);
					});

					$offsetObj.append($next_span.append($next_link));

					var $last_span = $("<span>");
					var $last_link = $("<a href='javascript:void(0);' title='末页'>末页</a>");
					$last_link.click(function() {
						parent.last();
						bigSelectFrame.display(parent);
					});
					$offsetObj.append($last_span.append($last_link));
				}
			}
		}
	};
	/**
	 * BigSelect HTML框架
	 */
	function BigSelectFrame() {
		/**
		 *	BigSelect 编号
		 */
		this.bsNO = +new Date();
		/**
		 * BigSelect 框架ID
		 */
		this.bigSelectId = 'bigSelect_' + this.bsNO;
		/**
		 * BigSelect 查询输入框ID
		 */
		this.bigSelectSearchId = 'bigSelect_search_' + this.bsNO;
		/**
		 * BigSelect 数据展示框ID
		 */
		this.bigSelectContentId = 'bigSelect_content_' + this.bsNO;
		/**
		 * BigSelect 分页展示框ID
		 */
		this.bigSelectPageId = 'bigSelect_page_' + this.bsNO;

		/**
		 * New base BigSelect
		 *
		 * @param {jQuery Object} $offset 目标元素对象
		 * @param {String} method 目标元素方法。$offset[method].eg: $offset['append'] etc.
		 * @return {BigSelectFrame}
		 * 	&lt;div class='bigSelect' id=''&gt;
		 * 		&lt;input type='search' autocomplete='off' id=''/&gt;
		 * 		&lt;div class='bigSelect_content'	id=''&gt;&lt;/div&gt;
		 * 		&lt;div class='bigSelect_page' id=''&gt;&lt;/div&gt;
		 * 	&lt;/div&gt;
		 */
		this.create = function($offset, method) {

			var $bigSelect = $("<div>").addClass("bigSelect").attr("id", this.bigSelectId);

			var $search = $("<input type='search' autocomplete='off' />").addClass("bigSelect_search").attr("id", this.bigSelectSearchId);

			var $content = $("<div>").addClass("bigSelect_content").attr('id', this.bigSelectContentId);

			var $page = $("<div>").addClass("bigSelect_page").attr("id", this.bigSelectPageId);

			$bigSelect.append($search).append($content).append($page);

			$offset[method]($bigSelect);

			return this;
		};
		/**
		 * 显示数据及分页信息
		 */
		this.display = function(page) {
			page.showPagedata(this);
			page.pageToolbar(this);
		};
	}


	$.fn.bigSelect = function(ds, options) {

		var opts = $.extend(true, {}, $.fn.bigSelect.defaults, options);

		var bigSelectDivFrame = new BigSelectFrame().create(this, "after");

		var dataSource = new DataSource();

		if (opts.dataType === 'Array') {
			dataSource.setDataSetFromArray(ds);
		} else {
			dataSource.setDataSetFromSelect(this);
		}

		var page = new Page().init(dataSource.dataSet, opts.pagesize);

		bigSelectDivFrame.display(page);

		$("#" + bigSelectDivFrame.bigSelectSearchId).keyup(function() {
			var ipt = escapeRegex($.trim($(this).val()));
			var reg = new RegExp("^" + ipt, "i");
			page.init(dataSource["getDataSetFrom"+opts.dataType](reg));
			bigSelectDivFrame.display(page);
		});
	};

	$.fn.bigSelect.defaults = {
		pagesize : 10,
		dataType : 'Select'
	};
})(jQuery);
