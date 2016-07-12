var Botkit = require('botkit');

var controller = Botkit.slackbot();

controller.setupWebserver(process.env.PORT, function(err, webserver){
    controller.createWebhookEndpoints(webserver);
});

controller.on('slash_command', function(bot, message) {
    bot.replyPrivate(':tree: this is a response to ' + message.command + 'entire message  ' + message);
});