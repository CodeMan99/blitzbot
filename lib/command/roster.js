var Command = require('./index.js').Command;
var helpers = require('../helpers.js');
var options = {
	argCount: 1,
	description: 'List a clan roster. Defaults to your own clan if no tag specified.',
	passRecord: true,
	signatures: ['@BOTNAME roster [tag]']
};
var roleOrder = Array.prototype.indexOf.bind(['commander', 'executive_officer', 'private']);
var roleStyle = {commander: /* bold */ '**', executive_officer: /* italics */ '*', 'private': null};

module.exports = new Command(roster, options, 'roster');

function roster(msg, record, tag) {
	return Promise.resolve().then(() => {
		if (tag) {
			tag = tag.toUpperCase();

			// if a tag does not follow the rules
			if (!tag.match(/^[A-Z0-9-_]{2,5}$/)) return null;

			return this.wotblitz.clans.list(tag, null, null, ['clan_id', 'tag']).then(list => {
				var result = list.find(clan => clan.tag === tag);

				return result && result.clan_id;
			});
		} else if (record.clan_id) {
			return record.clan_id;
		} else {
			return this.wotblitz.clans.accountinfo(record.account_id, null, 'clan_id').then(accountinfo => {
				return accountinfo[record.account_id] && accountinfo[record.account_id].clan_id;
			});
		}
	}).then(clan_id => {
		if (!clan_id) return null;

		return this.wotblitz.clans.info(clan_id, 'members', ['clan_id', 'name', 'members'])
			.then(info => {
				var clan = info[clan_id];
				var names = Object.keys(clan.members)
					.map(id => clan.members[id])
					.sort(helpers.sortBy({name: 'role', primer: roleOrder}, 'joined_at'))
					.map(member => {
						var style = roleStyle[member.role];
						var escapedName = member.account_name.replace(/[*_~]/g, '\\$&');

						return style ? style + escapedName + style : escapedName;
					});
				var text = 'The roster for `' + clan.name + '` is: ' + names.join(', ');

				return msg.reply(text).then(sent => {
					var result = {sentMsg: sent};

					if (record.account_id in clan.members) {
						result.updateFields = {clan_id: clan_id};
					}

					return result;
				});
			});
	});
}
