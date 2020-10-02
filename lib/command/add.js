const {Command} = require('./index.js');
const options = {
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

	return this.wotblitz.account.list(username).then(list => {
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

		return msg.reply(text).then(sent => {
			result.sentMsg = sent;

			return result;
		});
	});
}
