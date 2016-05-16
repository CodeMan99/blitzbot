var Command = require('./index.js').Command;
var async = require('async');
var wotblitz = require('wotblitz');
var options = {
  argCount: 1,
  argSplit: null,
  description: 'List tanks at the given mastery level (defaults to "Mastery")',
  passRecord: true,
  signatures: ['@BOTNAME mastery-list [level]'],
};

module.exports = new Command(masteryList, options, 'mastery-list');

function masteryList(msg, record, level) {
  level = level || 'Mastery';
  level = level[0].toUpperCase() + level.slice(1).toLowerCase();
  level = [
    {name: '3rd class', key: 1},
    {name: '2nd class', key: 2},
    {name: '1st class', key: 3},
    {name: 'Mastery', key: 4},
  ].find(lvl => lvl.name.startswith(level));

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
          console.log('sent msg: ' + sent);

          resolve();
        }, reject);
      }

      var limit = 100;
      var chunked = [];

      for (var i = 0; i < tankIds.length; i += limit) {
        chunked.push(tankIds.slice(i, i + limit));
      }

      async.map(chunked, (tankIdsChunk, callback) => {
        wotblitz.tankopedia.vehicles(tankIdsChunk, [], ['name', 'tier', 'nation'], callback);
      }, (cErr, chunkedVehicles) => {
        if (cErr) return reject(cErr);

        var vehicles = chunkedVehicles.reduce((a, b) => Object.assign(a, b));
        var played = stats[record.account_id].length;
        var percent = (vehicles.length / played) * 100;
        var text = `You have ${vehicles.length} tanks at ${level.name}, ${percent.toFixed} of your ${played} total tanks.\n`;

        text += Object.keys(vehicles)
          .map(id => `${vehicles[id].name} (${vehicles[id].nation}, ${vehicles[id].tier})`)
          .join('\n');

        this.client.reply(msg, text).then(sent => {
          console.log('sent msg: ' + sent);

          resolve();
        }, reject);
      });
    });
  });

  return p;
}
