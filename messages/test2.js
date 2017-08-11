var GAS = require('./getAnswerSync.js');
var sl = require('./syncLuis.js');
var question  = "人与室内环境连之伟教室在哪";
console.log(GAS.getIntentAndEntities(question));

// console.log(sl.getIntentLuis(question)[0]);