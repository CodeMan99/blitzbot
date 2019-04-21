const {Command} = require('./index.js');
const topDmgOptions = {
	argCount: 0,
	argSplit: ' ',
	description: 'Get your top 10 tanks by average damage',
	passRecord: true,
	signatures: ['@BOTNAME top-dmg']
};
const unknownTank = {
	name: 'Unknown vehicle',
	tier: '-',
	nation: '-'
};

const numFmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

module.exports = new Command(topDmgFn, topDmgOptions, 'top-dmg');

function topDmgFn(msg, record) {
	return this.wotblitz.tanks.stats(record.account_id, null, null, null, ['tank_id', 'all.battles', 'all.damage_dealt'])
		.then(data => data[record.account_id])
		.then(stats => stats.sort((a, b) => (b.all.damage_dealt / b.all.battles) - (a.all.damage_dealt / a.all.battles)).slice(0, 10))
		.then(top10 => {
			return this.wotblitz.encyclopedia.vehicles(top10.map(x => x.tank_id), null, ['name', 'tier', 'nation'])
				.then(vehicles => top10.map(x => Object.assign(x.all, unknownTank, vehicles[x.tank_id])));
		})
		.then(data => msg.reply('\n' + data.map((d, i) => `${i + 1}: ${numFmt.format(d.damage_dealt / d.battles)} dmg - ${d.name} (${d.nation}, ${d.tier})`).join('\n')))
		.then(sent => ({sentMsg: sent}));
}

