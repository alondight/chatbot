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
	console.log("senderId : " + senderId);
	console.log("contents : " + content);
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
				"recipient": { id: recipientId },
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
				"recipient" : { id: recipientId },
				  "message": {
					"attachment": {
						"type": "template",
						"payload": {
							"template_type": "list",
							"top_element_style": "compact",
							"elements": [{
									"title": "Works",
									"subtitle": "Take a look!",
									"image_url": "https://thesmc.co.kr/wp-content/uploads/2018/07/%ED%99%8D%EC%9D%B4.jpg",
									"buttons": [{
										"title": "Go!",
										"type": "web_url",
										"url": "https://thesmc.co.kr/works/",
										"messenger_extensions": "false",
										"webview_height_ratio": "full"
									}],
									"default_action": {
										"type": "web_url",
										"url": "https://thesmc.co.kr/works/",
										"messenger_extensions": "false",
										"webview_height_ratio": "full"
									}
								},
								{
									"title": "News",
									"subtitle": "Check our latest news",
									"image_url": "https://thesmc.co.kr/wp-content/uploads/2018/08/%EC%95%84%EB%B9%A0%EC%9D%98.jpg",
									"buttons": [{
										"title": "Go!",
										"type": "web_url",
										"url": "https://thesmc.co.kr/news/",
										"messenger_extensions": "false",
										"webview_height_ratio": "full"
									}],
									"default_action": {
										"type": "web_url",
										"url": "https://thesmc.co.kr/news/",
										"messenger_extensions": "false",
										"webview_height_ratio": "full"
									}
								}
							]
						}
					}
				}
			}
		}, function(error, response, body) {
			console.log("response : " +JSON.stringify(response));
			console.log("body : " +JSON.stringify(body));
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
				  "recipient": { id: recipientId },
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