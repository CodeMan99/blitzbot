const {Command} = require('./index.js');
const options = {
	argCount: 0,
	description: 'Get the nickname of the blitz account. Use the `add` command to change accounts.',
	passRecord: true,
	signatures: ['@BOTNAME whoami']
};
const command = new Command(whoami, options, 'whoami');

module.exports = command;

async function whoami(msg, record) {
	const id = record.account_id;
	const info = await this.wotblitz.account.info(id, null, null, ['nickname']);
	const nickname = info[id].nickname;
	const sent = await msg.reply('You are using `' + nickname + '` (account_id: ' + id + ')');
	const result = {sentMsg: sent};

	if (record.nickname !== nickname) result.updateFields = {nickname: nickname};

	return result;
}
