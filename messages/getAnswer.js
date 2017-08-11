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
	getAnswer:function(Question,dataset,callbackMap,callbackAnswer,callbackLesson){
		luis.askLuisIntent(Question,function(intentData){  // 自己定义回调处理json，类似这种方式
			intent = intentData.topScoringIntent.intent
			entities = intentData.entities
			//console.log(entities);
			console.log('Question Intent is: ',intent);
			switch(intent){
				case 'AskPath':
					startEnd = new Array();
					for(i in entities){
						var val = entities[i]['resolution']['values'][0]
						var place = myio.readPlace();
						console.log(place);
						if(place.indexOf(val)!=-1) startEnd.push(val)
					}
					// console.log(startEnd)
					callbackMap('AskPath',startEnd[0],startEnd[1]);
					break;
				case 'AskInfo':
					//console.log('In AskInfo');
					var questionTriple = getQuestionTriples(entities);

					// var questionTriple = test_triple;
					console.log('questionTriple is: ',questionTriple);
					//注意传入的qrealations为3元组（content,start,end）集合
					var answer = myutils.process('','',questionTriple[1],questionTriple[0],questionTriple[2],'AskInfo',dataset);
					// callbackAnswer(answer,questionTriple[1],questionTriple[0],questionTriple[2],intent);
					callbackAnswer(answer);
					break;
				case 'AskLesson':
					// var enin = GAS.getLessonFromQuestion(entities);
					// var qentities = enin[0];
					// var qrelation = enin[1];
					var answer = GAS.getLessonAnswer(entities);
					callbackLesson(answer);
					break;

			}
			//myio.write('./intentExample.txt',JSON.stringify(entities));
		});
	}
}

