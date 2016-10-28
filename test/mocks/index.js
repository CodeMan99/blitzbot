exports.commands = {
	client: {
		user: {
			id: '0101',
			username: 'testbot'
		}
	}
};

exports.createMessage = function(content, author, mentions) {
	if (mentions && !('size' in mentions)) mentions.size = mentions.length || Object.keys(mentions).length;

	return {
		'author': {
			sendMessage: text => Promise.resolve(text),
			username: author
		},
		channel: {
			sendMessage: text => Promise.resolve(text)
		},
		'content': content,
		'mentions': {
			users: mentions
		},
		reply: text => Promise.resolve(`@${author}, ${text}`)
	};
};
