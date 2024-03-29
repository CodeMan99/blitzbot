const {Command} = require('./index.js');
const {wotblitz: {default_region}} = require('../../blitzbot.json');
const options = {
	argCount: 1,
	description: 'Update your personal default region.',
	signatures: ['@BOTNAME set-region [region]']
};
const command = new Command(setRegion, options, 'set-region');

module.exports = command;

async function setRegion(msg, region) {
	switch (region && region.toLowerCase()) {
	case 'asia':
	case 'a':
		region = 'asia';
		break;
	case 'eu':
	case 'e':
		region = 'eu';
		break;
	case 'ru':
	case 'r':
		region = 'ru';
		break;
	case 'na':
	case 'n':
		region = 'na';
		break;
	default:
		region = default_region;
		break;
	}

	const sent = await msg.reply('Region set to "' + region + '".');

	return {
		sentMsg: sent,
		master: true,
		updateFields: {
			region: region
		}
	};
}
