const Command = require('./index.js').Command;
const options = {
	argCount: 0,
	description: 'Get the nickname of the blitz account. Use the `add` command to change accounts.',
	passRecord: true,
	signatures: ['@BOTNAME whoami']
};
const command = new Command(whoami, options, 'whoami');

module.exports = command;

function whoami(msg, record) {
	const id = record.account_id;

	return this.wotblitz.account.info(id, null, null, ['nickname']).then(info => {
		const nickname = info[id].nickname;

		return msg.reply('You are using `' + nickname + '` (account_id: ' + id + ')').then(sent => {
			const result = {sentMsg: sent};

			if (record.nickname !== nickname) result.updateFields = {nickname: nickname};

			return result;
		});
	});
}
