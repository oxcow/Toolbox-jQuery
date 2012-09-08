#jQuery BigSelect Plugin

基于大数据量的下拉选择插件。使用该插件可以将 html select 元素转化为列表一次显示多次，同时提供关键字匹配的功能，从而避免因 select 选择元素过多带来的不好用户体验。

### bigSelect(options)

***options*** : 可选参数。包括数据类型，分页大小等

***Example*** :　　
		
		// bind to select Element
		$("#selectone").bigSelect();
		
		// bind to input Element
		$("#inputone").bigSelect(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], {
			dataType : 'Array',
			pagesize : 5
		});
