var GAS = require('./getAnswerSync.js');
var sl = require('./syncLuis.js');
var question  = "人与室内环境连之伟教室在哪";
// console.log(GAS.getIntentAndEntities(question));
var TypeApi = 'https://southeastasia.api.cognitive.microsoft.com/luis/v2.0/apps/0b51b9e7-2200-40c5-9a7d-d644b430364e?subscription-key=fc7f3816353045959d517198742e11e3&timezoneOffset=0&verbose=true&q=';
try{
	var res = sl.getRes(TypeApi,question);
	console.log(res);
}catch(e){
	console.log('Time Out');
}


// console.log(sl.getIntentLuis(question)[0]);