const {Command} = require('./index.js');
const helpers = require('../helpers.js');
const options = {
	alias: 'r',
	argCount: 1,
	description: 'List a clan roster. Defaults to your own clan if no tag specified.',
	passRecord: true,
	signatures: [
		'@BOTNAME roster [tag]',
		'@BOTNAME r [tag]'
	]
};
const roleOrder = Array.prototype.indexOf.bind(['commander', 'executive_officer', 'private']);
const roleStyle = {commander: /* bold */ '**', executive_officer: /* italics */ '*', 'private': null};

module.exports = new Command(roster, options, 'roster');

function roster(msg, record, tag) {
	let getClanId;

	if (tag) {
		getClanId = searchClan.call(this, tag);
	} else if (record.clan_id) {
		getClanId = Promise.resolve(record.clan_id);
	} else {
		getClanId = memberClan.call(this, record.account_id);
	}

	return getClanId.then(clan_id => {
		if (!clan_id) return null;

		return this.wotblitz.clans.info(clan_id, 'members', ['clan_id', 'name', 'members'])
			.then(info => {
				const clan = info[clan_id];
				const names = Object.keys(clan.members)
					.map(id => clan.members[id])
					.sort(helpers.sortBy({name: 'role', primer: roleOrder}, 'joined_at'))
					.map(member => {
						const style = roleStyle[member.role];
						const escapedName = member.account_name.replace(/[*_~]/g, '\\$&');

						return style ? style + escapedName + style : escapedName;
					});
				const text = 'The roster for `' + clan.name + '` is: ' + names.join(', ');

				return msg.reply(text).then(sent => {
					const result = {sentMsg: sent};

					if (record.account_id in clan.members) {
						result.updateFields = {clan_id: clan_id};
					}

					return result;
				});
			});
	});
}

function searchClan(tag) {
	tag = tag.toUpperCase();

	// if a tag does not follow the rules
	if (!tag.match(/^[A-Z0-9-_]{2,5}$/)) return Promise.resolve(null);

	return this.wotblitz.clans.list(tag, null, null, ['clan_id', 'tag']).then(list => {
		const result = list.find(clan => clan.tag === tag);

		return result && result.clan_id;
	});
}

function memberClan(account_id) {
	return this.wotblitz.clans.accountinfo(account_id, null, 'clan_id').then(accountinfo => {
		return accountinfo[account_id] && accountinfo[account_id].clan_id;
	});
}
