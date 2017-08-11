var lessonEntities = ['课程课程名','课程教师'];
var myio = require('./myIO.js');
var myu2 = require('./myutils2.js');

sy = require("./syncLuis.js");
//var question  = "人与室内环境连之伟教室在哪";

// console.log('answer',answer);

module.exports = {
	getLessonFromQuestion:function(entities){
		qentities = new Array();
		qrelations = new Array();
		for(var i in entities){
			var entity = entities[i];
			var val = entity['resolution']['values'][0];
			if(entities[i].type == '课程关系') qrelations.push(val);
			else if(lessonEntities.indexOf(entity.type)!=-1){
				// console.log(entity.type)
				qentities.push(val);
			} 
		}
		return [qentities,qrelations];
	},
	getMapFromQuestion:function(entities){
		placeentities = new Array();
		for(var i in entities){
			var entity = entities[i];
			var val = entity['resolution']['values'][0];
			// placeentities.push(val);
			if(entities[i].type == '寻路地址') placeentities.push(val);
		}
		return placeentities;
	},
	getLessonAnswer:function(entities){
		// var res = sy.getIntentLuis(question);
		// var entities = res[0].entities;
		// console.log('status: '+res[1]);
		var qentities = this.getLessonFromQuestion(entities)[0];
		var qrelations = this.getLessonFromQuestion(entities)[1];
		var answer = myu2.getAnswerLesson(qentities,qrelations);
		return answer;
	},
	getMapAnswer:function(entities){
		// var res = sy.getIntentLuis(question);
		// var entities = res[0].entities;
		var placeentities = this.getMapFromQuestion(entities);
		var ans = myu2.getPlaceAnswer(placeentities);
		return ans;
	},
	getIntentAndEntities:function(question){
		var res = sy.getIntentLuis(question);
		var entities = res[0].entities;
		var intent = res[0].topScoringIntent==undefined  ? '' : res[0].topScoringIntent.intent;
		return [intent,entities];
	},
	getInfoAnswer:function(){
		
	}
}
