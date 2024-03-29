const {Command} = require('./index.js');
const MAX_TANK_ID_COUNT = 100;
const MAX_DISCORD_LINES = 20;
const options = {
	alias: 'ml',
	argCount: 1,
	argSplit: null,
	description: 'List tanks at the given mastery level (defaults to "Mastery").',
	passRecord: true,
	signatures: [
		'@BOTNAME mastery-list [level]',
		'@BOTNAME ml [level]'
	]
};

module.exports = new Command(masteryList, options, 'mastery-list');

async function masteryList(msg, record, level) {
	level = level || 'Mastery';
	level = level[0].toUpperCase() + level.slice(1).toLowerCase();
	level = [
		{name: 'None', key: 0},
		{name: '3rd class', key: 1},
		{name: '2nd class', key: 2},
		{name: '1st class', key: 3},
		{name: 'Mastery', key: 4}
	].find(lvl => lvl.name.startsWith(level));

	if (!level) return;

	const stats = await this.wotblitz.tanks.stats(record.account_id, null, null, null, ['mark_of_mastery', 'tank_id']);
	const tankIds = stats[record.account_id]
		.filter(stat => stat.mark_of_mastery === level.key)
		.map(stat => stat.tank_id);

	if (tankIds.length === 0) {
		const sent = await msg.reply(`I did *not* find any tanks at "${level.name}".`);

		return {sentMsg: sent};
	}

	const reqVehicles = [];
	const fields = ['name', 'tier', 'nation'];

	for (let i = 0; i < tankIds.length; i += MAX_TANK_ID_COUNT) {
		reqVehicles.push(this.wotblitz.encyclopedia.vehicles(tankIds.slice(i, i + MAX_TANK_ID_COUNT), null, fields));
	}

	const chunkedVehicles = await Promise.all(reqVehicles);
	const vehicles = Object.assign.apply(null, chunkedVehicles);
	const played = stats[record.account_id].length;
	const percent = (tankIds.length / played) * 100;
	const text = `You have ${tankIds.length} tanks at ${level.name}, ${percent.toFixed(2)}% of your ${played} total tanks.`;
	const lines = Object.keys(vehicles).map(id => {
		if (!vehicles[id]) return `Vehicle not in tankopedia, ${id}.`;

		return `${vehicles[id].name} (${vehicles[id].nation}, ${vehicles[id].tier})`;
	});
	const messages = [];

	if (lines.length < MAX_DISCORD_LINES) {
		const sent = await msg.reply(lines.concat(text).join('\n'));

		return {sentMsg: sent};
	}

	for (let i = 0; i < lines.length; i += MAX_DISCORD_LINES) {
		messages.push(msg.author.send(lines.slice(i, i + MAX_DISCORD_LINES).join('\n')));
	}

	messages.push(msg.reply(text));

	const sent = await Promise.all(messages);

	return {sentMsg: sent};
}
