var builder = require("botbuilder");
var createCards = new Object();


//var cardsName = ["cardShuttle","cardBus","cardAnthem","cardLibrary","cardCanteen"]
var cardsName = ["cardShuttle","cardAnthem","cardLibrary"]
createCards["cardShuttle"] = function(session){
    var card =  new builder.HeroCard(session)
    .title('校车')
    .subtitle('闵行校区与徐汇校区往返')
    .text('徐汇至闵行：06：45-21：30；闵行至徐汇：06：40-20：40')
    .images([
        builder.CardImage.create(session, 'http://static.panoramio.com/photos/large/18700973.jpg')
    ])
    .buttons([
        builder.CardAction.openUrl(session, 'http://houqin.sjtu.edu.cn/sview.asp?id=158', '查看时刻表'),
        builder.CardAction.postBack(session, 'tset', '查看时刻表')
    ]);
    // attach the card to the reply message
    return new builder.Message(session).addAttachment(card);
}


createCards["cardBus"] = function(session){
    var card = new builder.HeroCard(session)
        .title('校园巴士')
        .subtitle('菁菁堂广场始发')
        .text('闵行校区设有校园巴士，方便师生出行，工作日运行时间：07：30-20：10。')
        .images([
            builder.CardImage.create(session, 'http://static.panoramio.com/photos/large/18700973.jpg')
        ])
        .buttons([
            builder.CardAction.openUrl(session, 'http://houqin.sjtu.edu.cn/sview.asp?id=158', '查看时刻表')
        ]);
    // attach the card to the reply message
    return new builder.Message(session).addAttachment(card);
}


createCards["cardAnthem"] = function(session){
    var card = new builder.AudioCard(session)
    .title('上海交通大学校歌')
    .subtitle('王于之词，瞿维曲')
    .text('相聚在东海之滨，汲取知识的甘泉。交大，交大，学府庄严，师生切磋共涉艰险。为飞跃而求实，为创业而攻坚。同学们，同学们! 振兴中华，振兴中华。宏图在胸，重任在肩。'
          +'迎向那真理之光，扬起青春的风帆。交大，交大，群英汇聚，同舟共济远航彼岸。为自强而奋发，为人类多贡献。同学们，同学们! 饮水思源，饮水思源。母校的光荣，长存心田。')
    .image(builder.CardImage.create(session, 'http://www.sjtu.edu.cn/_mediafile/wwwsjtu2013/2013/09/26/24j7jwa2mg.jpg'))
    .media([
        { url: 'http://www.wavlist.com/movies/004/father.wav' }
    ])
    .buttons([
        builder.CardAction.openUrl(session, 'http://www.sjtu.edu.cn/xiaoli/xlactivitycontent.jsp?urltype=news.NewsContentUrl&wbtreeid=1253&wbnewsid=55762', '查看新版校歌《栋梁》')
    ]);   
    // attach the card to the reply message
    return new builder.Message(session).addAttachment(card);
}

createCards["cardLibrary"] = function(session){
    var cards = [
        new builder.HeroCard(session)
            .title('图书馆主馆')
            .subtitle('开放时间：周日至周四08:00-23:00，周五至周六08:00-22:00')
            .text('理工生医农综合馆，服务面积约为3.5万平方米，座位近4000席。')
            .images([
                builder.CardImage.create(session, 'http://www.lib.sjtu.edu.cn/uploadfile/2013/1130/20131130070052583.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', '自习室'),
                builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', '带我去')
            ]), 
            new builder.HeroCard(session)
            .title('包玉刚图书馆')
            .subtitle('开放时间：08:00-22:00')
            .text('人文社科综合馆，总藏书量约为72万册，阅览座位约1200席。')
            .images([
                builder.CardImage.create(session, 'http://www.lib.sjtu.edu.cn/uploadfile/2013/1201/20131201061534292.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', '自习室'),
                builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', '带我去')
            ]),
            new builder.HeroCard(session)
            .title('李政道图书馆')
            .subtitle('开放时间：08:00-22:00')
            .text('最大藏书容量约为7万册书刊，共有300余个阅览座位，5个小组讨论室')
            .images([
                builder.CardImage.create(session, 'http://www.lib.sjtu.edu.cn/uploadfile/2015/0518/20150518085845496.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', '自习室'),
                builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', '带我去')
            ])
        ];
     // create reply with Carousel AttachmentLayout
     return new builder.Message(session)
                .attachmentLayout(builder.AttachmentLayout.carousel)
                .attachments(cards);
}

createCards["cardCanteen"] = function(session){
    var cards = [
        new builder.HeroCard(session)
            .title('第一食堂大楼')
            .subtitle('早餐7：00-8：30；午餐11：00-13：00；晚餐 16：30-19：00')
            .text('位于思源南路与思源西路交汇处，主要服务西区三栋教学楼和一期学生公寓。')
            .images([
                builder.CardImage.create(session, 'http://static.panoramio.com/photos/large/18700973.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', '招牌菜'),
                builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', '带我去')
            ]), 
            new builder.HeroCard(session)
            .title('第二食堂大楼')
            .subtitle('早餐7：00-8：30；午餐11：00-13：00；晚餐 16：30-19：00')
            .text('位于东区大转盘以东，思源南路与学森路交汇处，主要服务东区三栋教学楼二期、三期学生公寓。')
            .images([
                builder.CardImage.create(session, 'http://static.panoramio.com/photos/large/18700973.jpgg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', '招牌菜'),
                builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', '带我去')
            ]), 
            new builder.HeroCard(session)
            .title('第一食堂大楼')
            .subtitle('早餐7：00-8：30；午餐11：00-13：00；晚餐 16：30-19：00')
            .text('位于思源北路与文俊路交汇处，主要服务四、五期学生公寓。')
            .images([
                builder.CardImage.create(session, 'http://static.panoramio.com/photos/large/18700973.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', '招牌菜'),
                builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', '带我去')
            ]), 
            new builder.HeroCard(session)
            .title('第一食堂大楼')
            .subtitle('早餐7：00-10：00；午餐11：00-12：00；晚餐 16：30-18：30')
            .text('位于南洋北路与南阳西路交汇处，主要服务六、七期学生公寓。')
            .images([
                builder.CardImage.create(session, 'http://static.panoramio.com/photos/large/18700973.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', '招牌菜'),
                builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', '带我去')
            ])
        ];
     // create reply with Carousel AttachmentLayout
     return new builder.Message(session)
                .attachmentLayout(builder.AttachmentLayout.carousel)
                .attachments(cards);
}


// createCards

module.exports.createCards = createCards;
module.exports.cardsName = cardsName;

/**
 * 使用样例
 * 根据名字发送对应card的信息
 *         for(var i=0;i<cards.cardsName.length;i++){
 *           var msg = cards.createCards[cards.cardsName[i]](session);  // 返回card生成的msg
 *           session.send(msg);
 *          }
 *       
 * 
 */