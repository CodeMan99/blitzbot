var Command = require('./index.js').Command;
var wotblitz = require('wotblitz');
var options = {
	argCount: 1,
	description: 'Associate your blitz username with discord.',
	signatures: ['@BOTNAME add <blitz-username>']
};

module.exports = new Command(add, options, 'add');

function add(msg, username) {
	if (!username) {
		return msg.reply('You must specify your Blitz username. Do *not* include the clan tag.').then(sent => {
			return {sentMsg: sent};
		});
	}

	username = username.toLowerCase();

	return wotblitz.account.list(username).then(list => {
		var player = list.find(a => a.nickname.toLowerCase() === username);
		var text;

		if (player) {
			text = 'Welcome! You now have access to all commands. :)';
		} else {
			text = 'No Blitz account found for `' + username + '`...';
		}

		return msg.reply(text).then(sent => {
			if (!player) return {sentMsg: sent};

			return {
				sentMsg: sent,
				updateFields: {
					account_id: player.account_id,
					nickname: player.nickname
				}
			};
		});
	});
}
