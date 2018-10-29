const Command = require('./index.js').Command;
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

function maxXpFn(msg, record) {
	return this.wotblitz.tanks.stats(record.account_id, null, null, null, ['tank_id', 'all.max_xp'])
		.then(data => data[record.account_id])
		.then(stats => stats.sort((a, b) => b.all.max_xp - a.all.max_xp).slice(0, 10))
		.then(top10 => {
			return this.wotblitz.encyclopedia.vehicles(top10.map(x => x.tank_id), null, ['name', 'tier', 'nation'])
				.then(vehicles => top10.map(x => Object.assign(x.all, unknownTank, vehicles[x.tank_id])));
		})
		.then(data => msg.reply(data.map((d, i) => `${i + 1}, ${d.max_xp} xp: ${d.name} (${d.nation}, ${d.tier})`).join('\n')))
		.then(sent => ({sentMsg: sent}));
}
