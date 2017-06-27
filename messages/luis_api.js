/**
 * luis 调用实例
 */

var https = require("https");  
//var iconv = require("iconv-lite");  // 解决中文乱码显示问题,这里未安装 
var querystring = require('querystring');  

module.exports = {
    askLuis: function(query,callback){
        this.loadData('/luis/v2.0/apps/9d9be608-0842-4217-829d-71f8096e309f?subscription-key=fc7f3816353045959d517198742e11e3&timezoneOffset=0&verbose=true&q='
         + querystring.escape(query),callback);
    },
    loadData: function(path,callback){
        var request_timer =null, request = null; 
        // 设置请求定时器，请求10秒超时
        var request_timer = setTimeout(function() {
            request.abort();
            console.log('Request Timeout.');
        }, 10000);
        var options = {
            host: 'southeastasia.api.cognitive.microsoft.com',
            port: 443,
            path: path,  // 查询路径
            method: 'GET',  // 请求方法
            headers: {'user-agent':'node.js'}  
        };
        var request = https.request(options,function(response){
            // 接受到请求，清除请求定时器，nodejs默认自带两分钟请求延时
            clearTimeout(request_timer);
            var data = '';  // 定义函数局部变量
            response.on('data',function(chunk){ data += chunk;});  // 获取request得到的数据
            response.on('end',function(){
                //console.log('打印接收到的json文本\n',data);
                callback(JSON.parse(data));  // 响应结束调用callback函数,为自己输入的函数句柄
            });
        }).on('error', function(e) {  // 捕捉请求错误
                console.log('problem with request: ' + e.message); 
        });
        request.end(); // 关闭请求
    },
}