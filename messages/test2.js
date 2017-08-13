// function getTime(entities){
// 	var times = new Array();
// 	for(var i in entities){
// 		var entity = entities[i];
// 		var val = entity['resolution']['values'] != undefined ? entity['resolution']['values'][0]: "";
// 		if(entity.type == 'builtin.datetimeV2.datetime') times.push(val); 
// 	}
// 	return times;
// }


// var la = require("./luis_api.js");
// la.askLuisIntent('计量经济学考试地点',function(data){
//     var entities = data.entities;

//     console.log(entities);
//     // console.log(getTime(entities));
// });
// var myio = require("./myIO");
// function getCalendarData(time,userName){
// 		var dataset = myio.readCanlendarData();
// 		var res = "";
// 		if(time == ""){
// 			for(var i in dataset){
// 				if(dataset[i][0]==userName){
// 					res+=dataset[i][3];
// 				}
// 			}
// 		}else{
// 			for(var i in dataset){
// 				if(dataset[i][0]==userName && dataset[i][1]==time){
// 					res+=dataset[i][3];
// 				}
// 			}
// 		}
// 		res = res=="" ? 'schedual not found' : res;
// 		return res;
// 	}

// console.log(getCalendarData("","xxx"));
// var mu = require("./myutils");
// var arr1 = [['xx','1',3],['yy',1,2]]
// console.log(mu.removeSmallEntity(arr1,arr1));
// var Q = "123456";
// console.log(Q.substring(3,Q.length))
var str = 'aaabbbcccaaabbbccc';   
　　var reg = 'aaa';   
　　var res = str.replace(reg, '111');
console.log(res); 