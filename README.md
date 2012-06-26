#<a id='top'>jQuery Tools Plugins</a>

1.[jCharLenCount 输入字数统计](#charlencount)

2.[jtitle 元素标题](#jtitle)


###<a id='charlencount'>jCharLenCount(maxLen)</a>

统计`textarea`|`input[type=text]`元素的输入字符数量.`jCharLenCount`接受一个参数。
别名：**`jcharlencount`**

***maxLen*** : 该参数用来限制被统计元素输入字符的最大长度。maxLen具体说明如下：

> maxLen <= 0 : 该对象不允许输入；

> maxLen > 0 : 该对象允许输入的最大字符数量，超过时只保留输入的[0,maxLen]个；

> maxLen = null : 只对该对象进行输入字符数量统计；

> maxLen = 未定义（undefined）：同maxLen = null;

> maxLen为字符串或者字符串数字 ： 提示非法输入，绑定失败。

**Example**:
        
        $("#charLenDemo").jCharLenCount(-10); // 不允许输入
        $("#charLenDemo1").jCharLenCount(200); // 最大输入200字
        $("#charLenDemo2").jCharLenCount(null); // 统计输入数量
        $("#charLenDemo3").jCharLenCount(); // 统计输入数量
        $("#charLenDemo4").jCharLenCount('123'); // error
        
###<a id='jtitle'>jtitle(title, options)</a>
显示元素提示消息。相当于`html`中某些元素的title属性。`jtitle`接受两个参数：

***title*** : 显示内容或为jQuery选择器。当为jQuery选择器时，显示内容为通过该jQuery选择器调用`html()`后的元素内容

***options*** : 

        $.fn.jtitle.defaults = {
            css : {
                width : 'auto', // 显示容器宽
                height : 'auto', // 显示容器高
                bgcolor : '#FFFFCC', // 显示容器背景色
                opacity : 0.8, // 显示容器背景色透明度[0,1]
                padding : '8px 8px', // 显示内容与容器的padding
            },
            openmouseleave : false, // 是否开启鼠标离开事件。默认为关
            className : null // 显示内容样式。
         };

**Example**:

        $("#titleDemo").jtitle('this is a jtitle test');
        $("#titleDemo1").jtitle('this is a jtitle test',{
            css : {
                width : 180,
                height : 20
            }
        });
        $("#titleDemo2").jtitle($("#txtid"),{
            css : {
                width : 300,
                height : 400,
                bgcolor : 'teal',
                opacity : 0.9,
                padding : '10px 10px'
            },
            openmouseleave : true,
            className : 'txtid'
        });

[返回顶部](#top)