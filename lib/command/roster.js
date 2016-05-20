var Command = require('./index.js').Command;
var helpers = require('../helpers.js');
var wotblitz = require('wotblitz');
var options = {
  argCount: 1,
  description: 'List a clan roster. Defaults to your own clan if no tag specified.',
  passRecord: true,
  signatures: ['@BOTNAME roster [tag]'],
};

module.exports = new Command(roster, options, 'roster');

function roster(msg, record, tag) {
  var promiseClanId = new Promise((resolve, reject) => {
    if (tag) {
      tag = tag.toUpperCase();

      // if a tag does not follow the rules
      if (!tag.match(/^A-Z0-9-_]{2,5}$/)) resolve(null);

      wotblitz.clans.list(tag, null, 1, ['clan_id', 'tag'], null, (err, list) => {
        if (err) return reject(err);

        var result = list.find(clan => clan.tag === tag);

        if (!result) return resolve(null);

        resolve(result.clan_id);
      });
    } else if (record.clan_id) {
      resolve(record.clan_id);
    } else {
      wotblitz.clans.accountinfo([record.account_id], [], ['clan_id'], null, (err, accountinfo) => {
        if (err) return reject(err);

        resolve(accountinfo[record.account_id].clan_id);
      });
    }
  });

  var promiseRecord = new Promise((resolve, reject) => {
    promiseClanId.then(clanId => {
      wotblitz.clans.info([clanId], ['members'], ['name', 'members'], null, (err, info) => {
        if (err) return reject(err);

        var members = info[clanId].members;
        var roleOrder = Array.prototype.indexOf.bind(['commander', 'executive_officer', 'private']);
        var roleStyle = {commander: /* bold */ '**', executive_officer: /* italics */ '*', 'private': null};
        var names = Object.keys(members)
          .map(id => members[id])
          .sort(helpers.sortBy({name: 'role', primer: roleOrder}, 'joined_at'))
          .map(member => {
            var style = roleStyle[member.role];
            var escapedName = member.account_name.replace(/([*_~])/g, '\\$1');

            return style ? style + escapedName + style : escapedName;
          });
        var text = 'The roster for `' + info[clanId].name + '` is: ' + names.join(', ');

        return this.client.reply(msg, text).then(sent => {
          if (record.account_id in members) {
            return resolve({
              sentMsg: sent,
              updateFields: {
                clan_id: clanId,
              },
            });
          }

          return resolve({sentMsg: sent});
        }, reject);
      });       // end "wotblitz.clans.info" callback
    }, reject); // end "promiseClanId.then" resolve
  });           // end "new Promise" constructor

  return promiseRecord;
}
