/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://aka.ms/abs-node-waterfall
-----------------------------------------------------------------------------*/
"use strict";


var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');

var fs = require('fs');
var myutils = require('./myutils.js');
var luis = require('./luis_api.js');
var read = require('./read.js');
var fileoptions = {flag:'a'};
var dataset = read.read()


var useEmulator = (process.env.NODE_ENV == 'development');
console.log(useEmulator);
var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});
//var connector = new builder.ConsoleConnector().listen();  // 使用控制台进行测试
var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));
// 将上一个问题的结果保存下来，对不同的conversionid进行存储
// 设置定时器，对每个conversionid加一个活跃度，每个一个小时加一，设置一个检查其活跃度的定时器，若10个小时不活跃，清除该用户上下午信息
// 可以对id进行处理，比如添加一些头，从而设置不同活跃度权重，默认以socketid作为conversionid

var lastDict = new Object();

var lastentity = '';  //
var lastquestionentity = '';
var lastquestionrelation = '';
// conversion_id
bot.dialog('/', [
    function (session) {
        var question = session.message.text;
       // session.send(session.message.user.id + " " + session.message.user.name);
        var name = session.message.user.name;
        // 将conversionid传入，从而得到上一个人的上下文
        if(lastDict.hasOwnProperty(name)){
            lastentity = lastDict[name].lastentity;
            lastquestionentity = lastDict[name].lastquestionentity;
            lastquestionrelation = lastDict[name].lastquestionrelation;
        } else{
            lastentity = '';  //
            lastquestionentity = '';
            lastquestionrelation = '';
        }
        if(!question) question = '一个输入错误';  // 设置非空
        else SetAnswer(session,question,name);
    }
]);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

function SetAnswer(session,question,clientName){
    luis.askLuis(question,function(data){  // 自己定义回调处理json，类似这种方式
            //console.log(JSON.stringify(data));
            // lastentity = '林忠钦';
            fs.writeFileSync(path.join(__dirname, './log.txt'),question+'\r\n',fileoptions);
            var entities = data.entities;
            var qrelations = new Array();
            var qentities = new Array();
            var qdescriptions = new Array();
            var qintent = data.topScoringIntent==undefined  ? '' : data.topScoringIntent.intent;
            //其中的内容应包含两个 entity的值与前后index用于唯一标示
            for(var i in entities){
                var entity = entities[i];
                var val = entity['resolution']['values']==undefined ? entity['resolution']['value'] : entity['resolution']['values'][0];
                var si = entity.startIndex;
                var ei = entity.endIndex;
                if(entity['type']=='关系'){
                    qrelations.push([val,si,ei]);
                }else if(entity['type']=='定语' || entity['type']=='builtin.number'){
                    qdescriptions.push([val,si,ei]);
                }else{
                    qentities.push([val,si,ei]);
                }
            }
            qentities = myutils.unique(qentities); 
            qentities = deleteSJTU(qentities,qintent);
            console.log('qe',qentities);
            if(qentities!=undefined && qentities[0]!=undefined &&　qentities[0][0]!=undefined) lastquestionentity = qentities;
            if(qrelations!=undefined && qrelations[0]!=undefined && qrelations[0][0]!=undefined) lastquestionrelation = qrelations[0][0];
            qrelations = myutils.unique(qrelations);
            qdescriptions = myutils.unique(qdescriptions);

            var qall = qentities.concat(qrelations).concat(qdescriptions);
            qentities = myutils.removeSmallEntity(qentities,qall);
            qrelations = myutils.removeSmallEntity(qrelations,qall);
            qdescriptions = myutils.removeSmallEntity(qdescriptions,qall);

            //console.log('关系=',qrelations,'实体=',qentities,'描述=',qdescriptions,'意图=',qintent,'last=',lastentity,'lastquestionentity=',lastquestionentity);
            // console.log('实体=',qentities);
            // console.log('描述=',qdescriptions);
            // console.log('意图=',qintent);

            var answer = myutils.process('','',qrelations,qentities,qdescriptions,qintent,dataset,question);
            if(answer == 'i dont know') answer = myutils.process(lastentity,'',qrelations,qentities,qdescriptions,qintent,dataset); //最开始的问法
            if(answer == 'i dont know'){
                qentities = qentities.concat(lastquestionentity);
                qentities = deleteSJTU(qentities);
                answer = myutils.process('',lastquestionrelation,qrelations,qentities,qdescriptions,qintent,dataset); //若把上次的实体全部加入
            } 
            if(answer == 'i dont know') answer = myutils.process('上海交通大学','',qrelations,qentities,qdescriptions,qintent,dataset);
            if(answer == '是' || answer == '不是'){
                if(qentities.length>0)
                    lastentity = qentities[0][0];
            }else if(answer == ''){
                lastentity = '';
            }else{
                lastentity = answer;
            }
            console.log('answer= '+ answer);
            // fs.writeFileSync(respath,no+'\t'+answer+'\t'+question+'\t'+trueanswer+'\t'+'\r\n',fileoptions);
            // fs.writeFileSync('./entities.txt',no+'\t'+qdescriptions.toString()+'\r\n',fileoptions);

            var lastObj = {
                'lastentity':lastentity,
                'lastquestionentity':lastquestionentity,
                'lastquestionrelation':lastquestionrelation
            };

            lastDict[clientName] = lastObj;

            session.send(answer);
        });
}
function deleteSJTU(entities,intent){
    if(intent == 'AskIf'){
        if(entities.length>=3) return myutils.removeSJTU(entities);
        else return entities;
    }else{
        if(entities.length>=2)  return myutils.removeSJTU(entities);
        else return entities;
    }

}