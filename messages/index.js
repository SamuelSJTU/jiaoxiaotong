/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://aka.ms/abs-node-waterfall
-----------------------------------------------------------------------------*/
"use strict";

var fs = require('fs');
var myutils = require('./myutils.js');
var luis = require('./luis_api.js');
var read = require('./read.js');

var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');

var KB = read.read();
console.log(KB);

var useEmulator = (process.env.NODE_ENV == 'development');
//var useEmulator = true;
var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});
//var connector = new builder.ConsoleConnector().listen();  // 使用控制台进行测试
var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));
var stack = new Array();  // 
bot.dialog('/', [
    // function (session) {
    //     console.log('开始');
    //     var question = session.message.text;
    //     if(!question) question = '一个输入错误';  // 设置非空
    //     console.log("问题: "+question);
    //     luis.askLuis(question,function(data){  // 自己定义回调处理json，类似这种方式
    //         console.log(data);
    //         var entities = data.entities;
    //         var qrelation;
    //         var qentities = new Array();
    //         var qdescription;
    //         for(var i in entities){
    //             var entity = entities[i];
    //             var val = entity['resolution']['values'][0];
    //             if(entity['type']=='关系'){
    //                 qrelation=val;
    //             }else if(entity['type']=='定语'){
    //                 qdescription=val;
    //             }else{
    //                 qentities.push(val);
    //             }
    //         }
    //         qentities = myutils.unique(qentities);
    //         console.log(qrelation);
    //         console.log(qentities);
    //         console.log(qdescription);
    //         var answer = '你貌似提出了一个世界级难题';
    //         for(var i in KB){
    //             var kb = KB[i];
    //             if(qentities[0] == kb[0] && qrelation == kb[1]) answer=kb[2];
    //         }
    //         session.send(answer);
    //     });
    // },
    function(session){
        //session.userData.name = session.message.text;
        builder.Prompts.text(session,"为什么你要殴打小怪兽！");
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "你几岁了?");
    },
    function (session, results) {
        session.userData.coding = results.response;
        builder.Prompts.choice(session, "你最擅长的bug生产模式?", ["JavaScript", "Python", "C++"],{listStyle:builder.ListStyle.button});
    },
    function (session, results) {
        session.userData.language = results.response.entity;
        session.send("我明白了... " + session.userData.name + 
                    " you've been programming for " + session.userData.coding + 
                    " years and use " + session.userData.language + ".");
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
