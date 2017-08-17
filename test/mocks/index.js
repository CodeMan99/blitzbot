// not actually mocking wotblitz; providing a single instance, mimicking the bot code
var wotblitz = require('wotblitz')();

exports.commands = {
	client: {
		user: {
			id: '0101',
			username: 'testbot'
		}
	},
	wotblitz: wotblitz
};

exports.createMessage = function(content, author, mentions) {
	if (mentions && !('size' in mentions)) mentions.size = mentions.length || Object.keys(mentions).length;

	return {
		'author': {
			send: text => Promise.resolve(text),
			username: author
		},
		channel: {
			send: text => Promise.resolve(text)
		},
		'content': content,
		'mentions': {
			users: mentions
		},
		reply: text => Promise.resolve(`@${author}, ${text}`)
	};
};
