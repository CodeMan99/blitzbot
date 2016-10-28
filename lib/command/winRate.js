var Command = require('./index.js').Command;
var wotblitz = require('wotblitz');
var twrOptions = {
	argCount: 1,
	argSplit: null,
	description: 'Get your win rate for the given tank.',
	passRecord: true,
	signatures: ['@BOTNAME tank-win-rate <tank-name>']
};
var tankWinRateCmd = new Command(twrFn, twrOptions, 'tank-win-rate');
var wrOptions = {
	argCount: 0,
	description: 'Get the win rate of your account.',
	passRecord: true,
	signatures: ['@BOTNAME win-rate']
};
var winRateCmd = new Command(wrFn, wrOptions, 'win-rate');

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

	return wotblitz.encyclopedia.vehicles(null, null, ['name', 'nation', 'tier']).then(vehicles => {
		// this filter is not good enough!
		var tankIds = Object.keys(vehicles).filter(id => vehicles[id].name.toLowerCase().indexOf(tankName) > -1);

		if (tankIds.length < 1) return null;
		if (tankIds.length > 100) {
			return msg.reply('Found too many vehicles with `' + tankName + '`.').then(sent => {
				return {sentMsg: sent};
			});
		}

		var user = msg.mentions.users.find((u, _, users) => u.id !== this.client.user.id && users.size <= 2);
		var exec = user ? new Promise((resolve, reject) => {
			this.db.findOne({_id: user.id}).exec((dbErr, record) => {
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

			return wotblitz.tanks.stats(record.account_id, null, tankIds, null, ['tank_id', 'all.battles', 'all.wins']).then(stats => {
				// tank stats does *not* error when tank_id has no information
				if (!stats[record.account_id]) {
					return msg.reply('I found no stats related to your search.').then(sent => {
						return {sentMsg: sent};
					});
				}

				var lines = stats[record.account_id].map(stat => {
					var tankopedia = vehicles[stat.tank_id];
					var winRate = (stat.all.wins / stat.all.battles) * 100;

					return tankopedia.name + ' (' + tankopedia.nation + ', ' + tankopedia.tier + '): ' +
						winRate.toFixed(2) + '%' + ' after ' + stat.all.battles + ' battles.';
				});

				return msg.reply(lines.join('\n')).then(sent => {
					return {sentMsg: sent};
				});
			});
		});
	});
}

function wrFn(msg, record) {
	return wotblitz.account.info(record.account_id, null, null, ['statistics.all.battles', 'statistics.all.wins']).then(info => {
		var wins = info[record.account_id].statistics.all.wins;
		var battles = info[record.account_id].statistics.all.battles;
		var percent = (wins / battles) * 100;
		var send = `You have won ${wins} of ${battles} battles. That is ${percent.toFixed(2)}% victory!`;

		if (record.wins && record.battles && battles - record.battles > 0) {
			percent = (record.wins / record.battles) * 100;
			send += `\nLast time you asked was ${battles - record.battles} battles ago, at ${percent.toFixed(2)}% victory.`;

			percent = ((wins - record.wins) / (battles - record.battles)) * 100;
			send += `\nOver those ${battles - record.battles} battles, you won ${percent.toFixed(2)}%!`;
		}

		return msg.reply(send).then(sent => {
			return {
				sentMsg: sent,
				updateFields: {
					wins: wins,
					battles: battles
				}
			};
		});
	});
}
