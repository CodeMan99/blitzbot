const {Command} = require('./index.js');
const rmAccents = require('remove-accents');
const helpers = require('../helpers.js');
const MAX_TANK_ID_COUNT = 100;
const twrOptions = {
	alias: 'twr',
	argCount: 1,
	argSplit: null,
	description: 'Get your win rate for the given tank.',
	passRecord: true,
	signatures: [
		'@BOTNAME tank-win-rate <tank-name>',
		'@BOTNAME twr <tank-name>'
	]
};
const tankWinRateCmd = new Command(twrFn, twrOptions, 'tank-win-rate');
const wrOptions = {
	alias: 'wr',
	argCount: 0,
	description: 'Get the win rate of your account.',
	passRecord: true,
	signatures: [
		'@BOTNAME win-rate',
		'@BOTNAME wr'
	]
};
const winRateCmd = new Command(wrFn, wrOptions, 'win-rate');

module.exports = {
	tankWinRate: tankWinRateCmd,
	winRate: winRateCmd
};

function twrFn(msg, authorRecord, tankName) {
	if (!tankName) {
		return msg.reply('Must specify a vehicle for "tank-win-rate".').then(sent => {
			return {sentMsg: sent};
		});
	}

	tankName = tankName.toLowerCase();

	return this.wotblitz.encyclopedia.vehicles(null, null, ['name', 'nation', 'tier']).then(vehicles => {
		const tankIds = Object.keys(vehicles).filter(id => {
			const name = vehicles[id].name.toLowerCase();

			return name.includes(tankName) || rmAccents(name).includes(tankName);
		});

		if (tankIds.length < 1) return null;
		if (tankIds.length > MAX_TANK_ID_COUNT) {
			return msg.reply('Found too many vehicles with `' + tankName + '`.').then(sent => {
				return {sentMsg: sent};
			});
		}

		const user = msg.mentions.users.find((u, _, users) => u.id !== this.client.user.id && users.size <= 2);
		const exec = user ? new Promise((resolve, reject) => {
			this.db.findOne({_id: user.id}, (dbErr, record) => {
				if (dbErr) return reject(dbErr);
				resolve(record);
			});
		}) : Promise.resolve(authorRecord);

		return exec.then(record => {
			if (!record && user) {
				return msg.reply(`I do not know who ${user.mention()} is. Sorry about that.`).then(sent => {
					return {sentMsg: sent};
				});
			}

			return this.wotblitz.tanks.stats(record.account_id, null, tankIds, null, ['tank_id', 'all.battles', 'all.wins', 'all.damage_dealt'])
				.then(stats => {
					// tank stats does *not* error when tank_id has no information
					if (!stats[record.account_id]) {
						return msg.reply('I found no stats related to your search.').then(sent => {
							return {sentMsg: sent};
						});
					}

					const lines = stats[record.account_id].map(stat => {
						const tankopedia = vehicles[stat.tank_id];
						const winRate = (stat.all.wins / stat.all.battles) * 100;
						const avgDmg = stat.all.damage_dealt / stat.all.battles;

						return tankopedia.name + ' (' + tankopedia.nation + ', ' + tankopedia.tier + '): ' +
							winRate.toFixed(2) + '%, ' + helpers.formatNumber(avgDmg) + ' damage after ' + stat.all.battles + ' battles.';
					});

					return msg.reply(lines.join('\n'), {split: true}).then(sent => {
						return {sentMsg: sent};
					});
				});
		});
	});
}

function wrFn(msg, record) {
	return this.wotblitz.account.info(record.account_id, null, null, ['statistics.all.battles', 'statistics.all.wins', 'statistics.all.damage_dealt'])
		.then(info => {
			const wins = info[record.account_id].statistics.all.wins;
			const battles = info[record.account_id].statistics.all.battles;
			const damage = info[record.account_id].statistics.all.damage_dealt;
			const result = {};

			let percent = (wins / battles) * 100;
			let avgDmg = damage / battles;
			let send = `You have won ${helpers.formatNumber(wins)} of ${helpers.formatNumber(battles)} battles. That is ${percent.toFixed(2)}% victory! Your average damage is ${helpers.formatNumber(avgDmg)}.`;

			if (record.wins && record.battles && battles - record.battles > 0) {
				percent = (record.wins / record.battles) * 100;
				send += `\nLast time you asked was ${helpers.formatNumber(battles - record.battles)} battles ago, at ${percent.toFixed(2)}% victory`;

				// Only print out previous damage if we've recorded it
				if (record.damage) {
					avgDmg = record.damage / record.battles;
					send += ` and ${helpers.formatNumber(avgDmg)} average damage dealt`;
				}
				send += `.`;

				percent = ((wins - record.wins) / (battles - record.battles)) * 100;
				avgDmg = (damage - record.damage) / (battles - record.battles);
				send += `\nOver those ${helpers.formatNumber(battles - record.battles)} battles, you won ${percent.toFixed(2)}%`;

				if (avgDmg) {
					send += ` with average damage of ${helpers.formatNumber(avgDmg)}`;
				}
				send += `!`;
			}

			if (!record.battles || battles - record.battles > 0) {
				result.updateFields = {
					wins: wins,
					battles: battles,
					damage: damage
				};
			}

			return msg.reply(send).then(sent => {
				result.sentMsg = sent;

				return result;
			});
		});
}
