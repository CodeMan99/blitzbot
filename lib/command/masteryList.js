var Command = require('./index.js').Command;
var async = require('async');
var wotblitz = require('wotblitz');
var options = {
  argCount: 1,
  argSplit: null,
  description: 'List tanks at the given mastery level (defaults to "Mastery").',
  passRecord: true,
  signatures: ['@BOTNAME mastery-list [level]'],
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
    {name: 'Mastery', key: 4},
  ].find(lvl => lvl.name.startsWith(level));

  if (!level) return Promise.resolve();

  var p = new Promise((resolve, reject) => {
    wotblitz.tankStats.stats(record.account_id, [], null, [
      'mark_of_mastery', 'tank_id',
    ], null, (err, stats) => {
      if (err) return reject(err);

      var tankIds = stats[record.account_id]
        .filter(stat => stat.mark_of_mastery === level.key)
        .map(stat => stat.tank_id);

      if (tankIds.length === 0) {
        return this.client.reply(msg, `I did *not* find any tanks at "${level.name}".`).then(sent => {
          resolve({sentMsg: sent});
        }, reject);
      }

      var limit = 100;
      var chunked = [];
      var i;

      for (i = 0; i < tankIds.length; i += limit) {
        chunked.push(tankIds.slice(i, i + limit));
      }

      async.map(chunked, (tankIdsChunk, callback) => {
        wotblitz.tankopedia.vehicles(tankIdsChunk, [], ['name', 'tier', 'nation'], callback);
      }, (cErr, chunkedVehicles) => {
        if (cErr) return reject(cErr);

        var vehicles = Object.assign.apply(null, chunkedVehicles);
        var played = stats[record.account_id].length;
        var percent = (tankIds.length / played) * 100;
        var text = `You have ${tankIds.length} tanks at ${level.name}, ${percent.toFixed(2)}% of your ${played} total tanks.`;
        var lines = Object.keys(vehicles).map(id => {
          if (!vehicles[id]) return `Vehicle not in tankopedia, ${id}.`;

          return `${vehicles[id].name} (${vehicles[id].nation}, ${vehicles[id].tier})`;
        });

        // line limit, to avoid discord's message length
        limit = 20;

        if (lines.length < limit) {
          this.client.reply(msg, lines.concat(text).join('\n')).then(sent => {
            resolve({sentMsg: sent});
          }, reject);

          return;
        }

        var messages = [];

        for (i = 0; i < lines.length; i += limit) {
          messages.push(this.client.sendMessage(msg.author, lines.slice(i, i + limit).join('\n')));
        }

        Promise.all(messages).then(sentDirect => {
          return this.client.reply(msg, text).then(sentChannel => {
            resolve({sentMsg: sentDirect.concat(sentChannel)});
          });
        }).catch(reject);
      }); // end async.map
    });   // end wotblitz.tankStats.stats
  });     // end new Promise

  return p;
}
