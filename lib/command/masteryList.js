var Command = require('./index.js').Command;
var MAX_TANK_ID_COUNT = 100;
var MAX_DISCORD_LINES = 20;
var options = {
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

function masteryList(msg, record, level) {
	level = level || 'Mastery';
	level = level[0].toUpperCase() + level.slice(1).toLowerCase();
	level = [
		{name: 'None', key: 0},
		{name: '3rd class', key: 1},
		{name: '2nd class', key: 2},
		{name: '1st class', key: 3},
		{name: 'Mastery', key: 4}
	].find(lvl => lvl.name.startsWith(level));

	if (!level) return Promise.resolve();

	return this.wotblitz.tanks.stats(record.account_id, null, null, null, ['mark_of_mastery', 'tank_id']).then(stats => {
		var tankIds = stats[record.account_id]
			.filter(stat => stat.mark_of_mastery === level.key)
			.map(stat => stat.tank_id);

		if (tankIds.length === 0) {
			return msg.reply(`I did *not* find any tanks at "${level.name}".`).then(sent => {
				return {sentMsg: sent};
			});
		}

		var reqVehicles = [];
		var fields = ['name', 'tier', 'nation'];
		var i;

		for (i = 0; i < tankIds.length; i += MAX_TANK_ID_COUNT) {
			reqVehicles.push(this.wotblitz.encyclopedia.vehicles(tankIds.slice(i, i + MAX_TANK_ID_COUNT), null, fields));
		}

		return Promise.all(reqVehicles).then(chunkedVehicles => {
			var vehicles = Object.assign.apply(null, chunkedVehicles);
			var played = stats[record.account_id].length;
			var percent = (tankIds.length / played) * 100;
			var text = `You have ${tankIds.length} tanks at ${level.name}, ${percent.toFixed(2)}% of your ${played} total tanks.`;
			var lines = Object.keys(vehicles).map(id => {
				if (!vehicles[id]) return `Vehicle not in tankopedia, ${id}.`;

				return `${vehicles[id].name} (${vehicles[id].nation}, ${vehicles[id].tier})`;
			});
			var messages = [];

			if (lines.length < MAX_DISCORD_LINES) {
				return msg.reply(lines.concat(text).join('\n')).then(sent => {
					return {sentMsg: sent};
				});
			}

			for (i = 0; i < lines.length; i += MAX_DISCORD_LINES) {
				messages.push(msg.author.send(lines.slice(i, i + MAX_DISCORD_LINES).join('\n')));
			}

			messages.push(msg.reply(text));

			return Promise.all(messages).then(sent => {
				return {sentMsg: sent};
			});
		});
	});
}
