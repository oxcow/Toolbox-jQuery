#jQuery Simple AutoComplete Plugin

一个简单的基于jQuery的输入自动提示

###sAutoComplete(datasource)

***datasource*** : 该参数为数据源。目前只支持html select元素，因此datasource目前为select元素选择器

**Example** : 

        $("#auto_search").sAutoComplete($("#data1"));
        <select name='sel1' id='data1'>
    	    <option value=''>请选择</option>
		    <option value='Java'>Java</option>
		    <option value='Javascript'>Javascript</option>
		    <option value='Php'>Php</option>
	    	<option value='.Net'>.Net</option>
	    </select>
**使用说明**: 请参看[simpleAutoComplete.html](../../simpleAutoComplete.html)