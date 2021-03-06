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
	 * 数据结构 : [{k : kv, v: vv}, {k : kv1, v: vv1}, {k : kv2, v: vv2}, ...]
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
			/**
			 * 当数据量很大时(>500),这段代码在IE7、IE8下性能表现很差。
			 * 应该跟浏览器对数组循环及元素属性获取的优化有关。
			 * Firefox,Chrome,IE9上性能差别不是很大。
			 *
			 * 2012/9/16: 改写该方法.使其先加载前400条数据展示给用户，其余数据通过timeout后获取.
			 *
			 * 2012/9/23: 使用分批加载后仍存在问题。当剩余数据没有加载完成时，虽然会显示出来第一页数据，但仍会导致浏览器阻塞而无法进行其他操作！
			 *
			 */
			if (dataType.toLowerCase() === 'select') {
				var s = +new Date();

				var $seldate = selectObj.find("option");

				var iLen = $seldate.length;

				this.dataSet = new Array(iLen);

				for (var i = 0; i < iLen; i++) {
					if (i < 400) {
						var opt = $seldate[i];
						var _k = $.trim($(opt).val());
						if (_k) {
							this.dataSet[i] = {
								key : _k,
								val : $.trim($(opt).text())
							};
						}
					} else {
						setTimeout(function() {
							var s1 = +new Date();
							for (var j = i; j < iLen; j++) {
								var opt = $seldate[j];
								var _k = $.trim($(opt).val());
								if (_k) {
									self.dataSet[j] = {
										key : _k,
										val : $.trim($(opt).text())
									};
								}
							}
							var e1 = +new Date();
							if (console) {
								console.info("加载option剩余元素 " + (iLen - 400) + " 花费: ", e1 - s1 + "ms");
							}
						}, 30);
						break;
					}
				}
				var e = +new Date();
				if (console) {
					console.info("加载options元素 400 花费: ", e - s + "ms");
				}
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
				if (!this.dataSet[i])
					continue;
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
		this.getStartIndex = function() {
			return (this.CURRENT_PAGE - 1) * this.DEFAULT_SIZE;
		};
		/**
		 * 分页数据结束索引
		 */
		this.getEndIndex = function() {
			return Math.min(this.TOTAL_SIZE, this.getStartIndex() + this.DEFAULT_SIZE);
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

			var $dataPlacement = $("#" + bigSelectFrame.bigSelectContentId);

			var $ul = $dataPlacement.find("ul");

			if (!$ul || $ul.length === 0) {
				$ul = $("<ul>").delegate("li", "click", function() {

					bigSelectFrame.caller.val($.data(this)[bigSelectFrame.opts.core.key]);

					setTimeout(function() {
						$("#" + bigSelectFrame.bigSelectId).hide("slow");
					}, 20);
				});
			} else {
				$ul.empty();
			}
			
			var frag = document.createDocumentFragment();
			var _sIdx = this.getStartIndex(), _eIdx = this.getEndIndex();
			var _val = bigSelectFrame.opts.core.val || "val";
			
			for (var i = _sIdx; i < _eIdx; i++) {

				if (!this.data[i])
					continue;

				var _v = this.data[i][_val];

				var $li = $("<li title='" + _v + "'><label>" + _v + "</label></li>");

				frag.appendChild($li[0]);

				$.data($li[0], this.data[i]);
			}

			$ul.append(frag);

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
			$offsetObj.find("span").remove();

			$total = $("<span>" + this.TOTAL_SIZE + "条数据 第" + this.CURRENT_PAGE + "/" + this.TOTAL_PAGE + "页</span>");

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

				// 页码跳转
				if (this.TOTAL_SIZE != 0) {
					var $jump_span = $("<span>").append("跳转到");
					if (this.TOTAL_PAGE < 16) {
						var $jump_select = $("<select>").bind("change", function() {
							parent.jumpto(this.value);
							bigSelectFrame.display(parent);
						});
						for (var i = 1; i <= this.TOTAL_PAGE; i++) {
							var $opt = $("<option value='" + i + "'>" + i + "</option>");
							$jump_select.append($opt);
						}

						$jump_select.val(this.CURRENT_PAGE);
						$jump_span.append($jump_select);

					} else {
						var $jump_input = $("<input/>", {
							type : 'text',
							maxlength : 2,
							value : this.CURRENT_PAGE,
							title : '回车跳转'
						});
						// jumpto event
						$jump_input.bind("keydown", function(event) {
							if (event.which == 13) {
								parent.jumpto(this.value);
								bigSelectFrame.display(parent);
							}
						});
						$jump_span.append($jump_input);
					}
					$offsetObj.append($jump_span.append("页"));
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
			var $bigSelect = $("<div>", {
				id : this.bigSelectId,
				title : "双击关闭",
				'class' : 'bigSelect'

			}).css({
				'background-color' : this.opts.css.bgcolor,
				opacity : this.opts.css.opacity,
				color : this.opts.css.color,
				width : this.opts.css.width
			});

			var $search = $("<input />", {
				type : 'search',
				autofocus : 'autofocus',
				id : this.bigSelectSearchId,
				autocomplete : 'off',
				'class' : 'bigSelect_search'
			});

			var $content = $("<div>", {
				id : this.bigSelectContentId,
				'class' : 'bigSelect_content'
			});

			var $page = $("<div>", {
				id : this.bigSelectPageId,
				'class' : 'bigSelect_page'
			});

			$bigSelect.append($search).append($content).append($page);

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

		/**
		 * 返回 BigSelectFrame显示的坐标位置
		 * @return {Object}
		 * 				{top : <Number>, left: <Number>}
		 */
		this.getOffset = function() {
			var width = this.opts.css.width;
			var caller_top = this.caller.offset().top;
			var caller_left = this.caller.offset().left;
			var caller_height = this.caller.outerHeight();
			var view_width = $(window).width();

			if (caller_left + width > view_width) {
				caller_left = view_width - width - 5;
			}
			return {
				top : caller_top + caller_height + 1,
				left : caller_left
			};
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

					if (!ipt) {
						page.reset(dataSource.dataSet);
					} else {
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
					}
					bigSelectFrame.display(page);
				});
			} else {
				if (bigSelectFrame.isHide()) {
					$('#' + bigSelectFrame.bigSelectSearchId).val('').trigger("keyup");
					$("#" + bigSelectFrame.bigSelectId).show("slow");
				}
			}
			// 根据浏览器窗口大小调整显示的位置
			$('#' + bigSelectFrame.bigSelectId).css(bigSelectFrame.getOffset());

		}
	};

	$.fn.bigSelect = function(options) {

		var opts = $.extend(true, {}, $.fn.bigSelect.defaults, options);

		var $label = $("<label>", {
			"for" : this.attr("id")
		}).css({
			cursor : 'pointer',
			padding : '0px 4px',
			'font-size' : '12px'
		}).append(opts.css.icon);

		this.after($label);

		var parent = this;

		$label.bind("click", function() {

			BigSelectFactory.create(parent, opts);

		});
	};

	$.fn.bigSelect.defaults = {
		core : {
			/**
			 *自动匹配模式.[START|END|LIKE]不区分大小写,默认为START
			 *
			 * START: 默认模式。匹配以输入开头的内容;
			 * END: 匹配以输入结尾的内容;
			 * LIKE: 匹配包含输入的内容;
			 *
			 */
			MatchMode : 'START',
			/**
			 * 分页大小.默认为20
			 *
			 */
			pagesize : 20,
			/**
			 * 数据类型.[SELECT|ARRAY|JSON]不区分大小写,默认为SELECT.
			 * SELECE: 默认类型.当为该类型时,调用该函数的对象应为select元素
			 * ARRAY: 数组类型.当为该类型时，需指定数组类型的data参数
			 * JSON: JSON类型.当为该类型时，需指定json类型的data参数
			 *
			 */
			dataType : 'SELECT',
			/**
			 * 数据集.可为数组或者json数据格式,默认为[]
			 */
			data : [],
			/**
			 * 指定最终获取数据所属数据集的属性.可取[key|val],默认为key
			 */
			key : 'key',
			/**
			 * 指定展示数据所属数据集的属性.可取[key|val],默认为val
			 */
			val : 'val'
		},
		css : {
			/**
			 * 背景色.默认#eeeeee
			 */
			bgcolor : '#eeeeee',
			/**
			 * 背景色透明度.默认0.9
			 */
			opacity : 0.9,
			/**
			 * 字体颜色.默认blank
			 */
			color : 'blank',
			/**
			 * 宽度.默认400px
			 */
			width : 400,
			/**
			 * 触发按钮.字符或者jQuery对象,默认为字符">"
			 */
			icon : ">"
		}
	};
})(jQuery);
