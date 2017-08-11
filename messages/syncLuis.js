var request = require('urllib-sync').request;
var querystring = require('querystring');
var TypeApi = 'https://southeastasia.api.cognitive.microsoft.com/luis/v2.0/apps/0b51b9e7-2200-40c5-9a7d-d644b430364e?subscription-key=fc7f3816353045959d517198742e11e3&timezoneOffset=0&verbose=true&q=';
var IntentApi = 'https://southeastasia.api.cognitive.microsoft.com/luis/v2.0/apps/50e3e9d8-ab3c-4438-b27c-c88b4949ecef?subscription-key=fc7f3816353045959d517198742e11e3&timezoneOffset=0&verbose=true&q=';
function getRes (Api,question) {
	// body...
	var Encodequestion = querystring.escape(question);
	var res = request(Api+Encodequestion);
	var buf = res.data;
	var content = JSON.parse(buf.toString("utf-8",0,buf.length));
	return [content,res.status]
}
module.exports = {
	getTypeLuis:function(question){
		return getRes(TypeApi,question)
	},
	getIntentLuis:function(question){
		return getRes(IntentApi,question)
	},
}
 

