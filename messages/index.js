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
var fileoptions = {flag:'a'};
var cards = require('./cards.js');
var GAS = require('./getAnswerSync');
//var useEmulator = (process.env.NODE_ENV == 'development');
console.log(useEmulator);
var useEmulator = true;
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

// var lastDict = new Object();
//var dictActivity = new Object();
// var myio = require("./myIO.js");
// var ga = require("./getAnswer.js");
// var dataPath = "./newData.txt";
// var dataset = myio.readNewData(dataPath);
// var ExamData = myio.readExam();

var userInfo = new Array();
setInterval(function(){
    for(var key in dictActivity){
        if(dictActivity[key]>10){
            delete dictActivity[key];
        }else{
            dictActivity[key] = dictActivity[key] + 1;
        }
    }
},600000); // 10min  单位ms 清除之前的信息,100min不连接清除上下文

var lastentity = '';  //
var lastquestionentity = '';
var lastquestionrelation = '';
// conversion_id
bot.dialog('/', [
    function (session) {
        var question = session.message.text;
        var useId = session.message.user.id;
        // var answer = GAS.getLessonAnswer(question);
        var intententities = GAS.getIntentAndEntities(question);
        var intent = intententities[0];
        var entities = intententities[1];
        if(question=='1'){
            var msg = cards.createCards["cardBus"](session); 
            session.send(msg);
        }else if(question=='2'){
            var msg = cards.createCards["cardAnthem"](session); 
            session.send(msg);
        }else if(question == '3'){
            var msg = cards.createCards["cardLibrary"](session); 
            session.send(msg);
        }else if(question=='path'){
            session.send('From:图书馆;To:上院');
        }else{
            session.send('this is answer');
        }
        // if(answer=='lackInfo'){
        //     builder.Prompts.text(session, 'Please complete your question~');
        // } 
        // else{
        //     session.send('the answer is: '+answer);
        // }

        saveUserInfo(useId,question);
    },
    function(session,results){
        // builder.Prompts.text(session, results.response);
        var question = session.message.text;
        var useId = session.message.user.id;
        session.send('your question has been completed');
        session.send('the old question is '+userInfo[useId]);
        session.send('the new question is '+question);
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





function deleteSJTU(entities,intent){
    if(intent == 'AskIf'){
        if(entities.length>=3) return myutils.removeSJTU(entities);
        else return entities;
    }else{
        if(entities.length>=2)  return myutils.removeSJTU(entities);
        else return entities;
    }
}

function saveUserInfo(userId,question){
    userInfo[userId] = question;
}


