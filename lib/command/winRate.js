var Command = require('./index.js').Command;
var wotblitz = require('wotblitz');
var twrOptions = {
  argCount: 1,
  argSplit: null,
  description: 'Get your win rate for the given tank.',
  passRecord: true,
  signatures: ['@BOTNAME tank-win-rate <tank-name>'],
};
var tankWinRateCmd = new Command(twrFn, twrOptions, 'tank-win-rate');
var wrOptions = {
  argCount: 0,
  description: 'Get the win rate of your account.',
  passRecord: true,
  signatures: ['@BOTNAME win-rate'],
};
var winRateCmd = new Command(wrFn, wrOptions, 'win-rate');

module.exports = {
  tankWinRate: tankWinRateCmd,
  winRate: winRateCmd,
};

function twrFn(msg, authorRecord, tankName) {
  if (!tankName) {
    return this.client.reply(msg, 'Must specify a vehicle for "tank-win-rate".').then(sent => {
      return {sentMsg: sent};
    });
  }

  tankName = tankName.toLowerCase();

  var p = new Promise((resolve, reject) => {
    wotblitz.tankopedia.vehicles(null, [], ['name', 'nation', 'tier'], (err, vehicles) => {
      if (err) return reject(err);

      var tankIds = Object.keys(vehicles).filter(id => {
        // this is not good enough!
        return vehicles[id].name.toLowerCase().indexOf(tankName) > -1;
      });

      if (tankIds.length < 1) return resolve(null);
      if (tankIds.length > 100) {
        return this.client.reply(msg, 'Found too many vehicles with `' + tankName + '`.').then(sent => {
          resolve({sentMsg: sent});
        }, reject);
      }

      var user = msg.mentions.find(u => u.id !== this.client.user.id && msg.mentions.length <= 2);
      var query = user ? this.db.findOne({_id: user.id}) : {exec: cb => cb(null, authorRecord)};

      query.exec((dbErr, record) => {
        if (dbErr) return reject(dbErr);
        if (!record && user) {
          return this.client.reply(msg, `I do not know who ${user.mention()} is. Sorry about that.`).then(sent => {
            resolve({sentMsg: sent});
          }, reject);
        }

        wotblitz.tankStats.stats(record.account_id, tankIds, null, [
          'tank_id', 'all.battles', 'all.wins',
        ], null, (sErr, stats) => {
          if (sErr) return reject(sErr);

          // tank stats does *not* error when tank_id has no information
          if (!stats[record.account_id]) {
            return this.client.reply(msg, 'I found no stats related to your search.').then(sent => {
              resolve({sentMsg: sent});
            }, reject);
          }

          var lines = stats[record.account_id].map(stat => {
            var tankopedia = vehicles[stat.tank_id];
            var winRate = (stat.all.wins / stat.all.battles) * 100;

            return tankopedia.name + ' (' + tankopedia.nation + ', ' + tankopedia.tier + '): ' +
              winRate.toFixed(2) + '%' + ' after ' + stat.all.battles + ' battles.';
          });

          this.client.reply(msg, lines.join('\n')).then(sent => {
            resolve({sentMsg: sent});
          }, reject);
        }); // end wotblitz.tankStats.stats
      });   // end query.exec
    });     // end wotblitz.tankopedia.vehicles
  });       // end new Promise

  return p;
}

function wrFn(msg, record) {
  var p = new Promise((resolve, reject) => {
    wotblitz.players.info([record.account_id], [], [
      'statistics.all.battles', 'statistics.all.wins',
    ], null, (err, info) => {
      if (err) return reject(err);

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

      this.client.reply(msg, send).then(sent => {
        resolve({
          sentMsg: sent,
          updateFields: {
            wins: wins,
            battles: battles,
          },
        });
      }, reject);
    });
  });

  return p;
}
