module.exports = {
	read:function(){
		var rf = require("fs");
		var data = rf.readFileSync("data.txt","utf-8");
		datas = data.split("\r\n");
		for(var i=0;i<datas.length;i++){
			datas[i]=datas[i].split(" ");
		}
		return datas;
	}
	
}