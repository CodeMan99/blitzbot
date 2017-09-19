var Command = require('./index.js').Command;
var options = {
	argCount: 0,
	description: 'Get the nickname of the blitz account. Use the `add` command to change accounts.',
	passRecord: true,
	signatures: ['@BOTNAME whoami']
};
var command = new Command(whoami, options, 'whoami');

module.exports = command;

function whoami(msg, record) {
	var id = record.account_id;

	return this.wotblitz.account.info(id, null, null, ['nickname']).then(info => {
		var nickname = info[id].nickname;

		return msg.reply('You are using `' + nickname + '` (account_id: ' + id + ')').then(sent => {
			var result = {sentMsg: sent};

			if (record.nickname !== nickname) result.updateFields = {nickname: nickname};

			return result;
		});
	});
}
