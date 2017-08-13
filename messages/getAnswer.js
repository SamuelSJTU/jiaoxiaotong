// 测试调用luis函数
var fs = require('fs');
var myutils = require('./myutils');
var luis = require('./luis_api.js');
var myio = require('./myIO.js');
var testQuestion = '上海交大校长是谁'
var test_triple = [[['上海交通大学',1,2]],[['校长',3,4]],[['现任',0,0]]]
var relationSet = ['职位','其他关系','学科','院长','校长','主任','党委职位'];
//var testQuestion = '上交校长是谁？'
var GAS = require('./getAnswerSync.js');
var PromptStatus = ['LessonHalf','PathHalf','LoginHalf','ExamHalf','RegisterHalf'];
var myutils2 = require('./myutils2.js');
var QBH = require('./QB_api.js');
function getQuestionTriples(entities){
		var qrelations = new Array();
		var qentities = new Array();
		var qdescriptions = new Array();
		for(var i in entities){
			var entity = entities[i];
			var val = entity['resolution']['values']==undefined ? entity['resolution']['value'] : entity['resolution']['values'][0];
			var si = entity.startIndex;
			var ei = entity.endIndex;
			if(relationSet.indexOf(entity['type'])!=-1){
				qrelations.push([val,si,ei]);
			}else if(entity['type']=='定语' || entity['type']=='builtin.number'){
				qdescriptions.push([val,si,ei]);
			}else{
				qentities.push([val,si,ei]);
			}
		}
		qentities = myutils.unique(qentities); 
		qrelations = myutils.unique(qrelations);
		qdescriptions = myutils.unique(qdescriptions);
		return [qentities,qrelations,qdescriptions];
	}


function getTime(entities){
	var times = new Array();
	for(var i in entities){
		var entity = entities[i];
		var val = entity['resolution']['values'] != undefined ? entity['resolution']['values'][0]['value']: "";
		if(entity.type == 'builtin.datetimeV2.datetime') times.push(val); 
	}
	return times;
}


function getRestTime(entities,Question){
	var startIndex=0;var endIndex=0;
	for(var i in entities){
		var entity = entities[i];
		var val = entity['resolution']['values'] != undefined ? entity['resolution']['values'][0]['value']: "";
		if(entity.type == 'builtin.datetimeV2.datetime'){
			startIndex = entity.startIndex;
			endIndex = entity.endIndex;
		} 
	}
	// var substr1 = Question.substring(0,startIndex);
	var substr2 = Question.substring(endIndex+1,Question.length);
	return substr2;
}


function afterProcessAnswer(lastanswerentity,lastentity,lastrelation,relations,qentities,descriptions,intent,dataset){
	var ans = myutils.process(lastanswerentity,'',relations,qentities,descriptions,'AskInfo',dataset);
	if(ans == 'i dont know') ans = myutils.process(lastentity,'',relations,qentities,descriptions,'AskInfo',dataset);
	if(ans == 'i dont know') ans = myutils.process('上海交通大学','',relations,qentities,descriptions,'AskInfo',dataset);
	return ans;
}
module.exports = {
	
	getParentRelation:function(entities){
		realtions = [];
		for(var i in entities){
			var entity = entities[i];
			if(relationSet.indexOf(entity.type)!=-1){
				return entity.type;
			}
		}
		return '';
	},
	getAnswer:function(Question,lastanswerentity,lastentity,lastrelation,dataset,callbackMap,callbackAnswer,callbackLesson,callbackExam,callbackQNA,callbackLogin,callbackLsch,callbackAsch,callbackBing){
		luis.askLuisIntent(Question,function(intentData){  // 自己定义回调处理json，类似这种方式
			intent = intentData.topScoringIntent.intent
			entities = intentData.entities
			// console.log(entities);
			console.log('Question Intent is: ',intent);
			switch(intent){
				case 'AskPath':
					var answer = GAS.getPathAnswer(entities);
					var entities = GAS.getMapFromQuestion(entities);
					callbackMap(answer,entities);
					break;
				case 'AskInfo':
					//console.log('In AskInfo');
					var questionTriple = getQuestionTriples(entities);
					console.log(questionTriple);
					// var questionTriple = test_triple;
					console.log('questionTriple is: ',questionTriple);
					//注意传入的qrealations为3元组（content,start,end）集合
					var relations = questionTriple[1];
					var qentities = questionTriple[0];
					var descriptions = questionTriple[2];
					var answer = myutils.process('','',relations,qentities,descriptions,'AskInfo',dataset,Question);
					if(answer == 'i dont know') answer = afterProcessAnswer(lastanswerentity,lastentity,lastrelation,relations,qentities,descriptions,'AskInfo',dataset);
					// callbackAnswer(answer,questionTriple[1],questionTriple[0],questionTriple[2],intent);
					callbackAnswer(answer);
					break;
				case 'AskLesson':
					// var enin = GAS.getLessonFromQuestion(entities);
					// var qentities = enin[0];
					// var qrelation = enin[1];
					var answer = GAS.getLessonAnswer(entities);
					var enin = GAS.getLessonEntity(entities);
					var entities = enin[0];
					var relation = enin[1][0];
					callbackLesson(answer,entities,relation);
					break;
				case 'AskExam':
					var answer = GAS.getExamAnswer(entities);
					var enin = GAS.getExamEntity(entities);
					var entities = enin[0];
					var relation = enin[1][0];
					callbackExam(answer,entities,relation);
					break;
				case 'AskLife':
					QBH.askQnAMaker(Question,function(answers){
						// 默认长度设置为1个
						callbackQNA('by QNA: '+answers[0].answer);
					});
					break;
				case 'AskQA':
					QBH.askQnAMaker(Question,function(answers){
						// 默认长度设置为1个
						callbackQNA(answers[0].answer);
					});
					break;
				case 'Login':
					callbackLogin()
					break;
				case 'SearchCalendar':
					var times = getTime(entities);
					var time = times.length == 0 ? "" : times[0];
					callbackLsch(time);
					break;
				case 'AddCalendar':
					var times = getTime(entities);
					var time = times.length == 0 ? "" : times[0];
					callbackAsch(time,getRestTime(entities,Question));
					break;
				default:
					//if intent is None
					QBH.askBing(Question,function(ans){
						callbackBing(ans);
					});
					

				

			}
			//myio.write('./intentExample.txt',JSON.stringify(entities));
		});
	},
	getHalfAnswer:function(Question,lastentities,lastrelation,PromptStatus,callbackLesson,callbackExam,callbackPath,callbackLogin,callbackRegister){
		luis.askLuisIntent(Question,function(intentData){
			intent = intentData.topScoringIntent.intent
			entities = intentData.entities
			switch(PromptStatus){
				case 'LessonHalf':
					var enin = GAS.getLessonEntity(entities);
					var qentitiesnew = enin[0];
					var qentities = qentitiesnew.concat(lastentities);
					console.log('================');
					console.log(qentities);
					console.log(lastrelation);
					var answer = myutils2.getAnswerLesson(qentities,lastrelation);
					callbackLesson(answer);
					break;
				case 'ExamHalf':
					var enin = GAS.getExamEntity(entities);
					var qentitiesnew = enin[0];
					var qentities = qentitiesnew.concat(lastentities);
					console.log('================');
					console.log(qentities);
					console.log(lastrelation);
					var answer = myutils2.getAnswerExam(qentities,lastrelation);
					callbackExam(answer);
					break;
				case 'PathHalf':
					console.log(entities);
					var qentitiesnew = GAS.getMapFromQuestion(entities);
					console.log(qentitiesnew);
					var qentities = qentitiesnew.concat(lastentities);
					var answer = GAS.getPlaceAnswer(qentities);
					callbackPath(answer);
					break;
				case 'LoginHalf':
					var username = Question;
					callbackLogin(username);
					break;
				case 'RegisterHalf':
					var pwd = Question;
					callbackRegister(pwd);
					break;
			}

		});
	},
	isHalfPhase:function(status){
		if(PromptStatus.indexOf(status)!=-1) return true;
		else return false;
	}
}

