/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://aka.ms/abs-node-waterfall
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var exec = require('child_process').exec;
var filename = 'test.py'
var editor={
    "name":'alex',
    "age":18,
    "address":'fghjh'
};
console.log(process.env.NODE_ENV)

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var global = new Object();

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

bot.dialog('/', [
    function (session) {
        var str = '{\\"name\\":\\"alex\\",\\"age\\":18,\\"address\\":\\"sdsdd\\"}'; //change the javascriptobject to jsonstring
        exec('python '+filename+' '+str,function(err,stdout,stdin){

        if(err){
            console.log('err');
        }
        if(stdout)
        {
            //parse the string
            console.log(stdout);
            var astr = stdout.split('\r\n').join('');//delete the \r\n
            global.obj = JSON.parse(astr);

            console.log('name',global.obj.name);
            console.log('age',global.obj.age);
            console.log('gender',global.obj.gender);
        }
        });
        builder.Prompts.text(session, "Hello... What's your name?"+global.obj.name);

    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.number(session, "Hi " + results.response + ", How many years have you been coding?"); 
    },
    function (session, results) {
        session.userData.coding = results.response;
        builder.Prompts.choice(session, "What language do you code Node using?", ["JavaScript", "CoffeeScript", "TypeScript"]);
    },
    function (session, results) {
        session.userData.language = results.response.entity;
        session.send("Got it... " + session.userData.name + 
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
