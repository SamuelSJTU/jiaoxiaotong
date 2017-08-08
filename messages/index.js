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
useEmulator = true;
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
var dictActivity = new Object();

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
        for(var i=0; i< CardNames.length;i++){
            var selectedCardName = CardNames[i];
            console.log(selectedCardName);
            var card = createCard(selectedCardName, session);
            // attach the card to the reply message
            var msg = new builder.Message(session).addAttachment(card);
            session.send(msg);
        }

        var question = session.message.text;
        // session.send(session.message.user.id + " " + session.message.user.name);


        var name = session.message.user.name;
        // 将conversionid传入，从而得到上一个人的上下文,刷新用户活跃度
        if(lastDict.hasOwnProperty(name)){
            lastentity = lastDict[name].lastentity;
            lastquestionentity = lastDict[name].lastquestionentity;
            lastquestionrelation = lastDict[name].lastquestionrelation;
            dictActivity[name] = 0;
        } else{
            lastentity = '';  
            lastquestionentity = '';
            lastquestionrelation = '';
            dictActivity[name] = 0;
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


var HeroCardName = 'Hero card';
var ThumbnailCardName = 'Thumbnail card';
var ReceiptCardName = 'Receipt card';
var SigninCardName = 'Sign-in card';
var AnimationCardName = "Animation card";
var VideoCardName = "Video card";
var AudioCardName = "Audio card";
var CardNames = [HeroCardName, ThumbnailCardName, ReceiptCardName, SigninCardName, AnimationCardName, VideoCardName, AudioCardName];

function createCard(selectedCardName, session) {
    switch (selectedCardName) {
        case HeroCardName:
            return createHeroCard(session);
        case ThumbnailCardName:
            return createThumbnailCard(session);
        case ReceiptCardName:
            return createReceiptCard(session);
        case SigninCardName:
            return createSigninCard(session);
        case AnimationCardName:
            return createAnimationCard(session);
        case VideoCardName:
            return createVideoCard(session);
        case AudioCardName:
            return createAudioCard(session);
        default:
            return createHeroCard(session);
    }
}

function createHeroCard(session) {
    return new builder.HeroCard(session)
        .title('BotFramework Hero Card')
        .subtitle('Your bots — wherever your users are talking')
        .text('Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.')
        .images([
            builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework/', 'Get Started')
        ]);
}

function createThumbnailCard(session) {
    return new builder.ThumbnailCard(session)
        .title('BotFramework Thumbnail Card')
        .subtitle('Your bots — wherever your users are talking')
        .text('Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.')
        .images([
            builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework/', 'Get Started')
        ]);
}

var order = 1234;
function createReceiptCard(session) {
    return new builder.ReceiptCard(session)
        .title('John Doe')
        .facts([
            builder.Fact.create(session, order++, 'Order Number'),
            builder.Fact.create(session, 'VISA 5555-****', 'Payment Method')
        ])
        .items([
            builder.ReceiptItem.create(session, '$ 38.45', 'Data Transfer')
                .quantity(368)
                .image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png')),
            builder.ReceiptItem.create(session, '$ 45.00', 'App Service')
                .quantity(720)
                .image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png'))
        ])
        .tax('$ 7.50')
        .total('$ 90.95')
        .buttons([
            builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/pricing/', 'More Information')
                .image('https://raw.githubusercontent.com/amido/azure-vector-icons/master/renders/microsoft-azure.png')
        ]);
}

function createSigninCard(session) {
    return new builder.SigninCard(session)
        .text('BotFramework Sign-in Card')
        .button('Sign-in', 'https://login.microsoftonline.com');
}

function createAnimationCard(session) {
    return new builder.AnimationCard(session)
        .title('Microsoft Bot Framework')
        .subtitle('Animation Card')
        .image(builder.CardImage.create(session, 'https://docs.microsoft.com/en-us/bot-framework/media/how-it-works/architecture-resize.png'))
        .media([
            { url: 'http://i.giphy.com/Ki55RUbOV5njy.gif' }
        ]);
}

function createVideoCard(session) {
    return new builder.VideoCard(session)
        .title('Big Buck Bunny')
        .subtitle('by the Blender Institute')
        .text('Big Buck Bunny (code-named Peach) is a short computer-animated comedy film by the Blender Institute, part of the Blender Foundation. Like the foundation\'s previous film Elephants Dream, the film was made using Blender, a free software application for animation made by the same foundation. It was released as an open-source film under Creative Commons License Attribution 3.0.')
        .image(builder.CardImage.create(session, 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/220px-Big_buck_bunny_poster_big.jpg'))
        .media([
            { url: 'http://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4' }
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'https://peach.blender.org/', 'Learn More')
        ]);
}

function createAudioCard(session) {
    return new builder.AudioCard(session)
        .title('I am your father')
        .subtitle('Star Wars: Episode V - The Empire Strikes Back')
        .text('The Empire Strikes Back (also known as Star Wars: Episode V – The Empire Strikes Back) is a 1980 American epic space opera film directed by Irvin Kershner. Leigh Brackett and Lawrence Kasdan wrote the screenplay, with George Lucas writing the film\'s story and serving as executive producer. The second installment in the original Star Wars trilogy, it was produced by Gary Kurtz for Lucasfilm Ltd. and stars Mark Hamill, Harrison Ford, Carrie Fisher, Billy Dee Williams, Anthony Daniels, David Prowse, Kenny Baker, Peter Mayhew and Frank Oz.')
        .image(builder.CardImage.create(session, 'https://upload.wikimedia.org/wikipedia/en/3/3c/SW_-_Empire_Strikes_Back.jpg'))
        .media([
            { url: 'http://www.wavlist.com/movies/004/father.wav' }
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'https://en.wikipedia.org/wiki/The_Empire_Strikes_Back', 'Read More')
        ]);
}
