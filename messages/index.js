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
//var GAS = require('./getAnswerSync.js');
//var useEmulator = (process.env.NODE_ENV == 'development');
var useEmulator = false;
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

var us = require('urllib-sync');
var userInfo = new Array();
bot.dialog('/', [
    function (session) {
        var question = session.message.text;
        var useId = session.message.user.id;
        // var answer = GAS.getLessonAnswer(question);
        //var intententities = GAS.getIntentAndEntities(question);
        // var intent = intententities[0];
        // var entities = intententities[1];
        // if(question=='1'){
        //     var msg = cards.createCards["cardBus"](session); 
        //     session.send(msg);
        // }else if(question=='2'){
        //     var msg = cards.createCards["cardAnthem"](session); 
        //     session.send(msg);
        // }else if(question == '3'){
        //     var msg = cards.createCards["cardLibrary"](session); 
        //     session.send(msg);
        // }else if(question=='path'){
        //     session.send('From:图书馆;To:上院');
        // }else{
        //     var answer = GAS.getInfoAnswer('askwhat',entities,question,'lastentity','lastrelation');
        //     session.send(answer);
        // }
        // console.log(intent);
        session.send(question);


        // switch (intent){
        //     case 'AskInfo':
        //         var answer = GAS.getInfoAnswer('askwhat',entities,question,'lastentity','lastrelation');
        //         session.send(answer)
        //         break;
        //     case 'AskLesson':
        //         var lessonEntities = GAS.getLessonFromQuestion(entities)[0];
        //         userInfo[userId]['lastQuesEntity'] = lessonEntities;
        //         userInfo[userId]['waterFallStatus'] = 'askLessonHalf';
        //         var answer = GAS.getLessonAnswer(entities);
        //         if(answer == 'LackInfoLesson'){
        //             builder.Prompts.text(session, 'Please complete your Lesson question~');
        //         }else{
        //             session.send(answer);
        //         }
        //         break;
        //     case 'AskPath':
        //         var answer = GAS.getPathAnswer(entities);
        //         var pathEntities = GAS.getMapFromQuestion(entities);
        //         userInfo[userId]['lastQuesEntity'] = pathEntities[0];
        //         userInfo[userId]['waterFallStatus'] = 'askPathHalf';
        //         if(answer == 'LackInfoPath'){
        //             builder.Prompts.text(session, 'Please complete your Path question~');
        //         }else{
        //             session.send(answer);
        //         }
        //         break;
        // }
        
        // userInfo[userId]['lastAnsEntity'] = answer;

        // if(answer=='lackInfo'){
        //     builder.Prompts.text(session, 'Please complete your question~');
        // } 
        // else{
        //     session.send('the answer is: '+answer);
        // }

        // saveUserInfo(useId,question);
    },
    function(session,results){
        // builder.Prompts.text(session, results.response);
        var question = session.message.text;
        var useId = session.message.user.id;
        switch(userId[userId]['waterFallStatus']){
            case 
        }
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





// function deleteSJTU(entities,intent){
//     if(intent == 'AskIf'){
//         if(entities.length>=3) return myutils.removeSJTU(entities);
//         else return entities;
//     }else{
//         if(entities.length>=2)  return myutils.removeSJTU(entities);
//         else return entities;
//     }
// }

// function saveUserInfo(userId,question){
//     userInfo[userId]['question'] = question;
// }



