var fs = require('fs');  

module.exports = {
	unique:function(array){
		var n = []; //用n来存放entity
		var res = [];
		for(var i = 0; i < array.length; i++){
		    if (n.indexOf(array[i][0]) == -1){
		    	n.push(array[i][0]);
		    	res.push(array[i]);
		    } 
		}
		return res;
	},
	process:function(lastentity,qrelations,qentities,qdescriptions,intent,dataset){
		//使用函数时 qentities请按句子中的Index排序
		// if(qentities.length==0) qentities.push([lastentity,-1,-1]);
		//将上一次entity作为一个
		if(lastentity!='') qentities.push([lastentity,-1,-1]);

		 
		var answer;
		if(intent == 'AskIf'){
			answer = false;
			var all = qentities.concat(qrelations);
			var puredes=[];
			for(var i in qdescriptions){
				if(this.indexOfArray(qdescriptions[i],all)) puredes.push(qdescriptions[i]);
			}
			qentities = this.disIndex(qentities); puredes = this.disIndex(puredes);
			qrelations = this.disIndex(qrelations);
			for(var i in dataset){
				var kb = dataset[i];
				//找到所有单描述的
				var tags = kb.slice(3,kb.length);
				if(qentities.indexOf(kb[0])!=-1 && qrelations.indexOf(kb[1])!=-1 && this.isChildSet(puredes,tags)){
					answer= true;
					break;
				} 
			}
			return answer+'';
		}else{
			answer = 'i dont know';
			// console.log(answer);
			var notDesRelations = [];
			for(var i in qrelations){
				if(this.indexOfArray(qrelations[i],qdescriptions)==-1) notDesRelations.push(qrelations[i]);
			}
			// console.log(notDesRelations);
			//若某关系不作为description，那么此关系一定更优
			var singleBestPair;
			if(notDesRelations.length!=0){			
				singleBestPair = this.getOneLogicBestPair(this.disIndex(qentities),this.disIndex(notDesRelations),this.disIndex(qdescriptions),dataset);
			}else{
				singleBestPair = this.getOneLogicBestPair(this.disIndex(qentities),this.disIndex(qrelations),this.disIndex(qdescriptions),dataset);
			}
			console.log('singlebest= '+singleBestPair);
			//若存在复合逻辑
			var doubleBestPair = [];
			if(qrelations.length<2){
				return singleBestPair==undefined ? 'i dont know' : singleBestPair[0];
			}else{
				var answ1 = this.getOneLogicBestPair(this.disIndex(qentities),this.disIndex(qrelations),this.disIndex(qdescriptions),dataset);
				if(answ1[1]!=0){
					var answ2 = this.getOneLogicBestPair([answ1[0]],this.disIndex(qrelations),this.disIndex(qdescriptions),dataset);
					console.log('answ2: '+answ2);
					if(answ2[1]!=-1) doubleBestPair = answ2;
				}
			}
			console.log('doublebest= '+doubleBestPair);
			if(doubleBestPair.length == 0 || doubleBestPair[1]==-1){
				if(singleBestPair[1]==-1) return 'i dont know';
				// console.log(singleBestPair);
				else return singleBestPair[0];
			}
			else return doubleBestPair[0];



			
			
		}
		return answer;
	},
	getDescriptionScore:function(qdescriptions,tags){
		var score=0;
		if(tags.indexOf('默认')>=0) score+=0.5;
		for (i in qdescriptions){
			if(tags.indexOf(qdescriptions[i])>=0) score+=1;
		}
		return score;
	},
	getSingleTripleScore:function(qentity,qrelation,qdescriptions,dataset){
		//若未找到 返回maxscore=0
		var res = [];
		var maxanswernum=0;
		var maxscore=-1;
		for(var i in dataset){
	        var kb = dataset[i];
	        // console.log(kb);
	        var tags = kb.slice(3,kb.length);
	        if(qentity == kb[0] && qrelation == kb[1]){ //匹配到了起始entity与relationship相同的      		
	        	var score = this.getDescriptionScore(qdescriptions,tags);
	            // console.log('该行知识得分: '+score);
	            if(score>maxscore){
	                maxscore = score; maxanswernum = i;
	            }
	        }
        }
       	answer = dataset[maxanswernum][2];
       	if(maxscore==-1){
       		res.push('i dont know');res.push(maxscore);
       	}else res.push(answer);res.push(maxscore);
       	return res;
	},
	disIndex:function(array){
		res = [];
		for(var i in array){
			res.push(array[i][0]);
		}
		return res;
	},
	getDisOneIndexArray:function(si,ei,array){
		res = [];
		for(var i in array){
			if(!(array[i][1]==si && array[i][2]==ei)) res.push(array[i]);
		}
		return res;
	},
	indexOfArray:function(ele,array){
		for(var i in array){
			if(ele[0] == array[i][0] && ele[1] == array[i][1] && ele[2] == array[i][2]) return i;
		}
		return -1;
	},
	getCommon:function(arr1,arr2){
		var res = [];
		for(i in arr1){
			if(indexOfArray(arr1[1],arr2)!=-1) res.push(arr1[i]);
		}
		if(res.length!=0) return false;
		return res;
	},
	getMaxPair:function(array){
		var v = [];
		for(var i in array){
			v.push(array[i][1]);
		}
		var index = v.indexOf(Math.max.apply(null,v));
		return array[index];
	},
	getOneLogicBestPair:function(entities,relations,descriptions,dataset){
		var respair = [];
		for(var i in relations){
			for(var j in entities){
				respair.push(this.getSingleTripleScore(entities[j],relations[i],descriptions,dataset));
			}
		}
		return this.getMaxPair(respair);
	},
	removeSmallEntity:function(entities,all){
		var res = [];
		for(var i in entities){
			var tag = true;
			for(var j in all){
				// if(i==j) continue;
				if(parseInt(entities[i][1])>=parseInt(all[j][1]) && parseInt(entities[i][2])<parseInt(all[j][2])) tag=false;
				if(parseInt(entities[i][1])>parseInt(all[j][1]) && parseInt(entities[i][2])<=parseInt(all[j][2])) tag=false;
			}
			if(tag){
				res.push(entities[i]);
			}
		}
		return res;
	},
	saveFile:function(data,path){
		data+='\r\n';
		fs.appendFile(path,data,'utf8',function(err){  
		    if(err)  
		    {  
		        console.log(err);  
		    }  
		});  
	},
	isChildSet:function(set1,set2){
		for(var i in set1){
			if(set2.indexOf(set1[i])==-1) return false;
		}
		return true;
	}	
	
}
