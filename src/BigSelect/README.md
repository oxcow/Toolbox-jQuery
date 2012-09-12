#jQuery BigSelect Plugin

基于大数据量的下拉选择插件。使用该插件可以将`html select`元素转化为一次显示多条的数据列表，同时提供关键字匹配的功能，可以对该`select`下拉元素进行筛选，从而减少选择范围。

该方法的实质是针对`select`下拉框进行列表展示并提供查询筛选。功能上类似[jQuery sAutoComplete Plugin](../sAutoComplete)的自动提示功能，区别在于`bigSelect`比起`sAutoComplete`更像是一个针对`select`的查询。

###bigSelect(options)

**options** : 可选参数。默认设置如下
    	
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

**Example** :

    $(".data1").bigSelect({
        core : {
            MatchMode : 'end'
		}
	});
    $("#data2").bigSelect({
        core : {
            MatchMode : 'LIKE',
			pagesize : 100
		},
		css : {
			width : 560,
			icon : ' >>点击打开选择'
		}
	});
    $("#data3").bigSelect({
    	core : {
			pagesize : 100
		},
		css : {
			width : 560,
			bgcolor : 'teal',
			color : '#313',
			opacity : 0.8,
			icon : $("#img1")
		}
	});
    
    <img id='img1' src="icon.png"/>
    <select name='sel1' class='data1'>...</select>
    <select name='sel2' id='data2'>...</select>
    <select name='sel3' id='data3'>...</select>
		
		