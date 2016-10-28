exports.commands = {
	client: {
		user: {
			id: '0101',
			username: 'testbot'
		}
	}
};

exports.createMessage = function(content, author, mentions) {
	return {
		'author': {
			sendMessage: text => Promise.resolve(text),
			username: author
		},
		channel: {
			sendMessage: text => Promise.resolve(text)
		},
		'content': content,
		'mentions': mentions,
		reply: text => Promise.resolve(`@${author}, ${text}`)
	};
};
