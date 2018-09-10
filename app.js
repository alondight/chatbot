'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

//작은 따옴표 사이에 본인이 받으신 token을 paste합니다.
//나중에 보안을 위해서 따로 setting을 하는 방법을 알려드리겠습니다.
//이 토큰이 포함된 파일을 절대 업로드하거나 github에 적용시키지 마세요.
var PAGE_ACCESS_TOKEN = 'EAAHb6g0Ra2kBAPkSqDuz5Q58ndSivwZCChbN0nu0Wi7rsUYHZByfvBy1EtteUZAYfehEePVzjd8Jhrx1FYOzDAv4Fhkt701akrtDeDJOf7GYc9FYP2Iamv79JdWmeSGT8O4uLpF7EpptZCX8ByhqpITeRsmgGESmANN8XueAAntRclyli6ZB8';

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('안녕하세요!ㅎㅎ THE SMC 입니다. ');
})


app.get('/webhook', function(req, res) {
    if (req.query['hub.verify_token'] === 'VERIFY_TOKEN') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
})

app.post("/webhook", function(req, res) {
    console.log("WEBHOOK GET IT WORKS");
    var data = req.body;
    console.log(data);

    // Make sure this is a page subscription
    if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach(function(pageEntry) {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iterate over each messaging event
            pageEntry.messaging.forEach(function(messagingEvent) {
                if (messagingEvent.optin) {
                    receivedAuthentication(messagingEvent);
                } else if (messagingEvent.message) {
                    receivedMessage(messagingEvent);
                } else if (messagingEvent.postback) {
                    receivedPostback(messagingEvent);
                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            });
        });

        res.sendStatus(200);
    }
});

function receivedMessage(event) {
    var senderId = event.sender.id;
    var content = event.message.text;
    sendTextMessage(senderId, content);
}

function receivedPostback(event) {
    console.log("RECEIVED POSTBACK IT WORKS");
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;

    var payload = event.postback.payload;

    console.log("Received postback for user %d and page %d with payload '%s' " +
        "at %d", senderID, recipientID, payload, timeOfPostback);

    sendTextMessage(senderID, "Postback called");
}

function sendTextMessage(recipientId, message) {
	message = String(message);
	if( message.indexOf("안녕") > -1 || message.indexOf("안뇽") > -1 || message.indexOf("hello") > -1) {
		request({
			url: 'https://graph.facebook.com/v2.6/me/messages',
			qs: { access_token: PAGE_ACCESS_TOKEN },
			method: 'POST',
			json: {
				recipient: { id: recipientId },
				"message":{
				  "attachment":{
					"type":"image", 
					"payload":{
					  "url":"https://thesmc.co.kr/wp-content/uploads/2018/08/%EC%82%AC%EC%98%A5.jpg", 
					  "is_reusable":true
					}
				  }
				}
			}
		}, function(error, response, body) {
			if (error) {
				console.log('Error sending message: ' + response.error);
			}
		});
	} else if (message.indexOf("다음") > -1 || message.indexOf("소개") > -1) {
		request({
			url: 'https://graph.facebook.com/v2.6/me/messages',
			qs: { access_token: PAGE_ACCESS_TOKEN },
			method: 'POST',
			json: {
				recipient: { id: recipientId },
				 "message":{
					"attachment":{
					  "type":"template",
					  "payload":{
						"template_type":"generic",
						"elements":[
						   {
							"title":"Welcome!",
							"image_url":"https://scontent-icn1-1.xx.fbcdn.net/v/t1.0-1/p200x200/39142999_382516482283675_6069927466682548224_n.png?_nc_cat=0&oh=65755865cd74bab3e8b328663dbefe87&oe=5C3020A8",
							"subtitle":"We have the right hat for everyone.",
							"default_action": {
							    "type": "web_url",
							    "url": "https://thesmc.co.kr/about/",
							    "messenger_extensions": false,
							    "webview_height_ratio": "FULL",
							    "fallback_url": "https://thesmc.co.kr/"
							},
							"buttons":[
							  {
								"type":"web_url",
								"url":"https://petersfancybrownhats.com",
								"title":"View Website"
							  },{
								"type":"postback",
								"title":"Start Chatting",
								"payload":"DEVELOPER_DEFINED_PAYLOAD"
							  }              
							]      
						  }
						]
					  }
					}
				  }
			}
		}, function(error, response, body) {
			if (error) {
				console.log('Error sending message: ' + response.error);
			}
		});
	} else {
		request({
			url: 'https://graph.facebook.com/v2.6/me/messages',
			qs: { access_token: PAGE_ACCESS_TOKEN },
			method: 'POST',
			json: {
				recipient: { id: recipientId },
				  "message":{
					"attachment":{
					  "type":"template",
					  "payload":{
						"template_type":"button",
						"text":"안녕하세요! THE SMC 입니다. 홈페이지를 구경 시켜드릴게요. ^.^",
						"buttons":[
						  {
							"type":"web_url",
							"url":"https://thesmc.co.kr/about/",
							"title":"About"
						  },
						  {
							"type":"web_url",
							"url":"https://thesmc.co.kr/peoples/",
							"title":"Peoples"
						  },
						  {
							"type":"web_url",
							"url":"https://thesmc.co.kr/service/",
							"title":"Service"
						  }
						]
					  }
					}
				  }
			}
		}, function(error, response, body) {
			if (error) {
				console.log('Error sending message: ' + response.error);
			}
		});
	}
}
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'));
})