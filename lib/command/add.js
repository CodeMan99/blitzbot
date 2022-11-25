const {Command} = require('./index.js');
const options = {
	argCount: 1,
	description: 'Associate your blitz username with discord.',
	signatures: ['@BOTNAME add <blitz-username>']
};

module.exports = new Command(add, options, 'add');

async function add(msg, username) {
	if (!username) {
		const sent = await msg.reply('You must specify your Blitz username. Do *not* include the clan tag.');

		return {sentMsg: sent};
	}

	username = username.toLowerCase();

	const list = await this.wotblitz.account.list(username);
	const record = list.find(a => a.nickname.toLowerCase() === username);
	const result = {};

	let text;

	if (record) {
		result.updateFields = record;
		// reset wins & battles, they likely are not related to `record.account_id`
		result.updateFields.wins = 0;
		result.updateFields.battles = 0;
		text = 'Welcome! You now have access to all commands. :)';
	} else {
		text = 'No Blitz account found for `' + username + '`...';
	}

	result.sentMsg = await msg.reply(text);

	return result;
}
