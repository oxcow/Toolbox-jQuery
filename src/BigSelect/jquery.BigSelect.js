/**
 * jQuery BigSelect Plugin 用来批量显示下拉框元素,或者显示指定array/json数据。适合用于下拉数据量较大的情况
 *
 * @author leeyee
 * @date 2012-09
 * @requires jQuery v1.2.3 or later
 *
 */
(function($) {
	/**
	 * 正则输入字符转义
	 */
	function escapeRegex(value) {
		return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	}

	/**
	 * 数据存储对象
	 *
	 * 数据结构 : [{k : kv, v: vv}, {k1 : kv1, v1: vv1}, {k2 : kv2, v2: vv2}, ...]
	 *
	 */
	function DataSource() {
		/**
		 * 数据集
		 */
		this.dataSet = [];

		/**
		 * 设置数据集
		 *
		 * @param {jQuery Object}
		 *            selectObj select元素jQuery 对象 .
		 * @param {String}
		 *            dataType 数据类型.取值范围[select|array|json]不区分大小写.
		 * @param {Array}
		 *            data 数据。当dataType = [array|json]有效.
		 *
		 */
		this.setDataSet = function(selectObj, dataType, data) {
			var self = this;
			if (dataType.toLowerCase() === 'select') {
				//var s = +new Date();
				var $seldate = selectObj.find("option");
				$seldate.each(function(idx, elem) {
					var _k = $.trim($(elem).val());
					if (_k) {
						self.dataSet.push({
							key : _k,
							val : $.trim($(elem).text())
						});
					}
				});
				//var e = +new Date();
				//console.info(e - s);
			}
			if (dataType.toLowerCase() === 'array') {
				$.each(data, function(_k, _v) {
					self.dataSet.push({
						key : $.trim(_k),
						val : $.trim(_v)
					});
				});
			}
			if (dataType.toLowerCase() === 'json') {
				$.each($.parseJSON(data), function(_k, _v) {
					self.dataSet.push({
						key : $.trim(_k),
						val : $.trim(_v)
					});
				});
			}
		};
		/**
		 * 获取指定正则匹配的数据集
		 *
		 * @param {RegExp}
		 *            reg 过滤正则表达式
		 * @param {string}
		 *            mode 定义匹配的是数据集结构中的key还是val.取值范围[key|val]
		 *
		 * @return {Array} 返回匹配数据数组
		 *
		 */
		this.getRegExpDataSet = function(reg, mode) {
			var matchDate = [];
			for (var i = 0; i < this.dataSet.length; i++) {
				var v = this.dataSet[i][mode];
				if (reg.test(v)) {
					matchDate.push(this.dataSet[i]);
				}
			}
			return matchDate;
		};
	}

	/**
	 * 分页对象
	 *
	 * @param {Array}
	 *            data 被分页所有数据集合.默认为[].
	 * @param {Number}
	 *            pageSize 分页大小.默认一页20条数据
	 *
	 */
	function Page(data, pagesize) {
		/**
		 * 分页数据
		 */
		this.data = data || [];
		/**
		 * 默认分页大小
		 */
		this.DEFAULT_SIZE = pagesize || 20;
		/**
		 * 当前页
		 */
		this.CURRENT_PAGE = 1;
		/**
		 * 总记录数
		 */
		this.TOTAL_SIZE = this.data.length;
		/**
		 * 总页数
		 */
		this.TOTAL_PAGE = Math.ceil(this.TOTAL_SIZE / this.DEFAULT_SIZE);

		/**
		 * 重置Page对象
		 *
		 * @param {Array}
		 *            aData 被分页所有数据集合.默认为[].
		 * @param {Number}
		 *            pagesize 分页大小
		 *
		 */
		this.reset = function(aData, pageSize) {
			this.data = aData;
			this.DEFAULT_SIZE = pageSize || this.DEFAULT_SIZE;
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
		 *
		 * @param {Number}
		 *            page_num 页码
		 */
		this.jumpto = function(page_num) {
			if (page_num > 0 && page_num <= this.TOTAL_PAGE)
				this.CURRENT_PAGE = parseInt(page_num);
		};
		/**
		 * 显示分页数据
		 *
		 * @param {BigSelectFrame}
		 *            bigSelectFrame BigSelect HTML框架对象
		 */
		this.showPagedata = function(bigSelectFrame) {
			$dataPlacement = $("#" + bigSelectFrame.bigSelectContentId);
			$dataPlacement.find('ul').detach();
			var $ul = $("<ul>");
			for (var i = this.start(); i < this.end(); i++) {

				var _v = this.data[i][bigSelectFrame.opts.core.val || "val"];

				var $li = $("<li>");

				var $label = $("<label>").attr("title", _v).html(_v).css({
					'cursor' : 'pointer'
				}).data(this.data[i]);

				$label.click(function() {

					bigSelectFrame.caller.val($(this).data()[bigSelectFrame.opts.core.key]);

					setTimeout(function() {
						$("#" + bigSelectFrame.bigSelectId).hide("slow");
					}, 10);
				});

				$ul.append($li.append($label));
			}
			$dataPlacement.append($ul);
		};

		/**
		 * 显示分页工具条
		 *
		 * @param {BigSelectFrame}
		 *            bigSelectFrame BigSelect HTML框架对象
		 */
		this.showPageToolbar = function(bigSelectFrame) {

			var parent = this;

			var $offsetObj = $("#" + bigSelectFrame.bigSelectPageId);

			// 移除已有的分页工具条
			$offsetObj.find("span").detach();

			$total = $("<span>共 " + this.TOTAL_SIZE + " 条数据 </span>");

			$offsetObj.append($total);

			if (this.TOTAL_PAGE != 1) {
				// 首页,上一页
				if (this.CURRENT_PAGE > 1) {
					var $first_span = $("<span>");
					var $first_link = $("<a href='javascript:void(0);' title='首页'>首页</a>");

					// first page event
					$first_link.click(function() {
						parent.first();
						bigSelectFrame.display(parent);
					});

					$offsetObj.append($first_span.append($first_link));

					var $pre_span = $("<span>");
					var $pre_link = $("<a href='javascript:void(0);' title='上一页'>上一页</a>");

					// previous page event
					$pre_link.click(function() {
						parent.previous();
						bigSelectFrame.display(parent);
					});

					$offsetObj.append($pre_span.append($pre_link));
				}

				// 页码跳转
				if (this.TOTAL_SIZE != 0) {
					var $jump_span = $("<span>第</span>");
					var $jump_input = $("<input type='text' maxlength='2' value='" + this.CURRENT_PAGE + "'/>");

					// jumpto event
					$jump_input.bind("keydown", function(event) {
						if (event.which == 13) {
							parent.jumpto(this.value);
							bigSelectFrame.display(parent);
						}
					});
					var $jump = $jump_span.append($jump_input).append("/" + this.TOTAL_PAGE + "页");
					$offsetObj.append($jump);
				}

				// 下一页 ,末页
				if (this.CURRENT_PAGE < this.TOTAL_PAGE) {
					var $next_span = $("<span>");
					var $next_link = $("<a href='javascript:void(0);' title='下一页'>下一页</a>");

					// next page event
					$next_link.click(function() {
						parent.next();
						bigSelectFrame.display(parent);
					});

					$offsetObj.append($next_span.append($next_link));

					var $last_span = $("<span>");
					var $last_link = $("<a href='javascript:void(0);' title='末页'>末页</a>");

					// last page event
					$last_link.click(function() {
						parent.last();
						bigSelectFrame.display(parent);
					});
					$offsetObj.append($last_span.append($last_link));
				}
			}
		};
	}

	/**
	 * BigSelect HTML框架
	 *
	 * <pre>
	 * &lt;div class='bigSelect' id='' title='双击关闭'&gt;
	 * 	&lt;input type='search' autocomplete='off' id=''/&gt;
	 * 	&lt;div class='bigSelect_content' id=''&gt;&lt;/div&gt;
	 * 	&lt;div class='bigSelect_page' id=''&gt;&lt;/div&gt;
	 * &lt;/div&gt;
	 * </pre>
	 *
	 * @param {Object}
	 *            caller 该类的调用对象
	 * @param {Object}
	 *            options 框架属性
	 *
	 *
	 */
	function BigSelectFrame(caller, options) {
		/**
		 * 该类的调用对象
		 */
		this.caller = caller;
		/**
		 * 参数
		 */
		this.opts = options;
		/**
		 * 获取BigSelect编号
		 *
		 * @return BigSelect编号
		 */
		this.getBsNo = function() {
			var id = this.caller.attr("id");
			// 如果调用该方法的DOM对象id属性为空,则为其随机生成一个id
			if (!id) {
				id = +new Date();
				this.caller.attr("id", id);
			}
			return id;
		};
		/**
		 * 框架ID
		 */
		this.bigSelectId = 'bigSelect_' + this.getBsNo();
		/**
		 * 查询输入框ID
		 */
		this.bigSelectSearchId = 'bigSelect_search_' + this.getBsNo();
		/**
		 * 数据展示框ID
		 */
		this.bigSelectContentId = 'bigSelect_content_' + this.getBsNo();
		/**
		 * 分页展示框ID
		 */
		this.bigSelectPageId = 'bigSelect_page_' + this.getBsNo();
		/**
		 * 判断当前bigSelectId是否存在
		 *
		 * @return {Boolean} 存在返回true,否则返回false
		 *
		 */
		this.isExistBsNo = function() {
			var $obj = $("#bigSelect_" + this.getBsNo());
			return ($obj) && ($obj.length != 0);
		};
		/**
		 * 判断当前框架是否为隐藏状态
		 */
		this.isHide = function() {
			var display = $("#" + this.bigSelectId).css('display');
			return display === 'none' ? true : false;
		};
		/**
		 * New Base BigSelect
		 *
		 * @return {BigSelectFrame}
		 * <pre>
		 * &lt;div class='bigSelect' id='' title='双击关闭'&gt;
		 * 	&lt;input type='search' autocomplete='off' id=''/&gt;
		 * 	&lt;div class='bigSelect_content' id=''&gt;&lt;/div&gt;
		 * 	&lt;div class='bigSelect_page' id=''&gt;&lt;/div&gt;
		 * &lt;/div&gt;
		 * </pre>
		 *
		 */
		this.create = function() {

			var $bigSelect = $("<div>").attr("id", this.bigSelectId).addClass("bigSelect").css({
				'background-color' : this.opts.css.bgcolor,
				opacity : this.opts.css.opacity,
				color : this.opts.css.color,
				width : this.opts.css.width
			});

			var $search = $("<input type='search' autocomplete='off' />").addClass("bigSelect_search").attr("id", this.bigSelectSearchId);

			var $content = $("<div>").addClass("bigSelect_content").attr('id', this.bigSelectContentId);

			var $page = $("<div>").addClass("bigSelect_page").attr("id", this.bigSelectPageId);

			$bigSelect.append($search).append($content).append($page);

			$bigSelect.attr("title", "双击关闭");

			var parent = this;
			$bigSelect.dblclick(function() {
				$bigSelect.hide("slow");
			});

			return $bigSelect;
		};
		/**
		 * 显示数据及分页信息
		 *
		 * @param {Page}
		 *            page 分页对象
		 *
		 */
		this.display = function(page) {
			page.showPagedata(this);
			page.showPageToolbar(this);
		};
	}

	var BigSelectFactory = {

		create : function(obj, options) {

			var bigSelectFrame = new BigSelectFrame(obj, options);

			if (!bigSelectFrame.isExistBsNo()) {

				var dataSource = new DataSource();

				dataSource.setDataSet(obj, options.core.dataType, options.core.data);

				var page = new Page(dataSource.dataSet, options.core.pagesize);

				obj.after(bigSelectFrame.create());

				bigSelectFrame.display(page);

				// bind search event
				$("#" + bigSelectFrame.bigSelectSearchId).keyup(function() {
					var ipt = escapeRegex($.trim($(this).val()));
					var matchMode = options.core.MatchMode.toUpperCase();
					var reg = null;
					switch(matchMode) {
						case 'START':
							reg = new RegExp("^" + ipt, "i");
							break;
						case 'END':
							reg = new RegExp(ipt + "$", "i");
							break;
						case 'LIKE':
							reg = new RegExp(ipt, "i");
							break;
						default:
							reg = new RegExp("^" + ipt, "i");
					}
					page.reset(dataSource.getRegExpDataSet(reg, options.core.val));
					bigSelectFrame.display(page);
				});
			} else {
				if (bigSelectFrame.isHide()) {
					$('#' + bigSelectFrame.bigSelectSearchId).val('').trigger("keyup");
					$("#" + bigSelectFrame.bigSelectId).show("slow");
				}
			}
		}
	};

	$.fn.bigSelect = function(options) {
		var opts = $.extend(true, {}, $.fn.bigSelect.defaults, options);
		var txt = opts.css.icon;
		var $label = $("<label>").attr({
			"for" : this.attr("id")
		}).append(txt).css({
			'cursor' : 'pointer',
			'font-size' : '12px',
			'padding' : '0px 4px'
		});

		this.after($label);

		var parent = this;

		$label.bind("click", function() {

			BigSelectFactory.create(parent, opts);

		});
	};

	$.fn.bigSelect.defaults = {
		core : {
			/**
			 *自动匹配模式.[START|END|LIKE]
			 *
			 * START: 默认模式。匹配以输入开头的内容;
			 * END: 匹配以输入结尾的内容;
			 * LIKE: 匹配包含输入的内容;
			 *
			 */
			MatchMode : 'START',
			/**
			 * 分页大小
			 *
			 */
			pagesize : 10,
			/**
			 * 数据类型.[SELECT|ARRAY|JSON]
			 * SELECE: 默认类型.当为该类型时,调用该函数的对象应为select元素
			 * ARRAY: 数组类型.当为该类型时，需指定数组类型的data参数
			 * JSON: JSON类型.当为该类型时，需指定json类型的data参数
			 *
			 */
			dataType : 'select',
			/**
			 * 数据集.可为[ARRAY|JSON]
			 */
			data : [],
			key : 'key',
			val : 'val'
		},
		css : {
			bgcolor : '#eeeeee',
			opacity : 0.9,
			color : 'blank',
			width : 400,
			icon : ">"
		}
	};
})(jQuery);
