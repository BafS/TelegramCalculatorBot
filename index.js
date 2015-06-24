
var rest = require('restler'),
	math = require('mathjs');

var API_KEY = ''; // Put your API key
var API_URL = 'https://api.telegram.org/';

// You can also pass the API key by arg
if(process.argv[2]) {
	API_KEY = process.argv[2];
}

TelegramBot = rest.service(function() {}, { baseURL: API_URL + 'bot' + API_KEY + '/' });

var client = new TelegramBot();

function telegramBotApi(path, data, fn) {
	if(!fn) {
		fn = function() {};
	}
	if(!data) {
		data = {};
	}
	client.get(path, { data: data }).on('complete', fn);
}

// Print the name of the bot
telegramBotApi('getMe', {}, function(obj) {
	console.log('# ' + obj.result.username + ' #');
});

function getUpdate(data, fn) {
	telegramBotApi('getUpdates', data, function(obj) {
		var result = obj.result;

		if(result.length > 0) {
			fn(result);
			data.offset = result[0].update_id + 1;
		}

		getUpdate(data, fn);
	});
}

function sendMessage(data, fn) {
	telegramBotApi('sendMessage', data, fn);
}

// When new message (handler)
getUpdate({ timeout: 60000, limit: 5 }, function(res) {
	console.log(res[0]);

	var text = res[0].message.text;
	var chatId = res[0].message.chat.id;

	var result = '';


	if(text) {
		// Bot specificaly (for groups)
		if(text[0] === '@') {
			text = text.substr(text.indexOf(' ') + 1);

		}

		if(text.substr(0, 2) === '!=') {
			text = text.substr(2);
			try {
				// Eval expression
				result = math.eval(text);
			} catch (e) {}
		}
		else if(text.substr(0, 5) === '!help') {
			result = "# Calculator Bot #\n!= <expression>\nExample: != sin(10) + 1";
		}
	}

	sendMessage({ chat_id: chatId, text: result});
});
