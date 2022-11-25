const {Command} = require('./index.js');
const maxXpOptions = {
	description: 'Get your top 10 *max-xp* values.',
	passRecord: true,
	signatures: ['@BOTNAME max-xp']
};
const unknownTank = {
	name: 'Unknown vehicle',
	tier: '-',
	nation: '-'
};

module.exports = new Command(maxXpFn, maxXpOptions, 'max-xp');

async function maxXpFn(msg, record) {
	const data = await this.wotblitz.tanks.stats(record.account_id, null, null, null, [
		'tank_id',
		'all.max_xp'
	]);
	const stats = data[record.account_id].sort((a, b) => b.all.max_xp - a.all.max_xp).slice(0, 10);
	const vehicles = await this.wotblitz.encyclopedia.vehicles(stats.map(stat => stat.tank_id), null, [
		'name',
		'tier',
		'nation'
	]);
	const text = stats.map(({tank_id, all: {max_xp}}, i) => {
		const vehicle = Object.assign({}, unknownTank, vehicles[tank_id]);
		const position = i + 1;

		return `${position}, ${max_xp} xp: ${vehicle.name} (${vehicle.nation}, ${vehicle.tier})`;
	});
	const sent = await msg.reply(text.join('\n'));

	return {sentMsg: sent};
}
