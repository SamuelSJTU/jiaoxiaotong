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
var lastentity = ''; 

bot.dialog('/', [
    function (session) {
        var question = session.message.text;
        if(!question) question = '一个输入错误';  // 设置非空
        luis.askLuis(question,function(data){  // 自己定义回调处理json，类似这种方式
            //console.log(JSON.stringify(data));
            myutils.saveFile(question,path.join(__dirname, './qlog.txt'));

            var entities = data.entities;
            var qrelations = new Array();
            var qentities = new Array();
            var qdescriptions = new Array();
            var qintent = data.topScoringIntent== undefined ? '' : data.topScoringIntent.intent;
            //其中的内容应包含两个 entity的值与前后index用于唯一标示
            for(var i in entities){
                var entity = entities[i];
                var val = entity['resolution']['values']==undefined ? entity['resolution']['value'] : entity['resolution']['values'][0];
                var si = entity.startIndex;
                var ei = entity.endIndex;
                if(entity['type']=='关系'){
                    qrelations.push([val,si,ei]);
                }else if(entity['type']=='定语' || entities['type']=='builtin.number'){
                    qdescriptions.push([val,si,ei]);
                }else{
                    qentities.push([val,si,ei]);
                }
            }

            qentities = myutils.unique(qentities);
            qrelations = myutils.unique(qrelations);
            qdescriptions = myutils.unique(qdescriptions);

            var qall = qentities.concat(qrelations).concat(qdescriptions);
            qentities = myutils.removeSmallEntity(qentities,qall);
            qrelations = myutils.removeSmallEntity(qrelations,qall);
            qdescriptions = myutils.removeSmallEntity(qdescriptions,qall);

            console.log('关系=',qrelations);
            console.log('实体=',qentities);
            console.log('描述=',qdescriptions);
            console.log('意图=',qintent);

            var answer = myutils.process('',qrelations,qentities,qdescriptions,qintent,dataset);
            if(answer=='i dont know') answer = myutils.process(lastentity,qrelations,qentities,qdescriptions,qintent,dataset);
            console.log('answer= '+ answer);

            session.send(answer);
        });
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
