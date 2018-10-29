#!/usr/bin/env node

const Commands = require('../lib/command').Commands;
const Datastore = require('nedb');
const Discord = require('discord.js');
const auth = require('../blitzbot.json');
const helpers = require('../lib/helpers.js');
const pkg = require('../package.json');
const serveReferences = require('../lib/serveReferences.js');
const wotblitz = require('wotblitz');

(() => { // Add commands scope, no need to pollute module scope.
	const add = require('../lib/command/add.js');
	const createHelp = require('../lib/command').createHelp;
	const devel = require('../lib/command/development.js');
	const donate = require('../lib/command/donate.js');
	const greet = require('../lib/command/greet.js');
	const masteryList = require('../lib/command/masteryList.js');
	const maxXp = require('../lib/command/maxXp.js');
	const roster = require('../lib/command/roster.js');
	const whoami = require('../lib/command/whoami.js');
	const setRegion = require('../lib/command/setRegion.js');
	const wr = require('../lib/command/winRate.js');

	Commands.add(add);
	Commands.add(devel.changes);
	Commands.add(donate);
	Commands.add(devel.version);
	Commands.add(greet.hello);
	Commands.add(masteryList);
	Commands.add(maxXp);
	Commands.add(roster);
	Commands.add(whoami);
	Commands.add(setRegion);
	Commands.add(wr.winRate);
	Commands.add(wr.tankWinRate);
	Commands.add(createHelp());
})();

const client = new Discord.Client();
const createDatabase = name => new Datastore({filename: './blitzbot' + name + '.db', timestampData: true});
const master = createDatabase('-master');
const regions = {
	na: new Commands(client, createDatabase(''), wotblitz(auth.wotblitz.key, wotblitz.REGION_NA)),
	eu: new Commands(client, createDatabase('-eu'), wotblitz(auth.wotblitz.key, wotblitz.REGION_EU)),
	ru: new Commands(client, createDatabase('-ru'), wotblitz(auth.wotblitz.key, wotblitz.REGION_RU)),
	asia: new Commands(client, createDatabase('-asia'), wotblitz(auth.wotblitz.key, wotblitz.REGION_ASIA))
};
const regionLetter = {
	n: 'na',
	e: 'eu',
	r: 'ru',
	a: 'asia'
};

process.title = pkg.name;
client.rest.userAgentManager.set({url: pkg.homepage, version: pkg.version});

client.on('ready', () => {
	console.log('blitzbot ready!');
	console.log('===============');
	console.error('blitzbot ready!');
	console.error('===============');
});

client.on('message', message => {
	// Bot will only respond in a DM or when mentioned.
	if (message.channel.type !== 'dm' && !message.isMentioned(client.user)) return;
	if (message.author.id === client.user.id || message.author.bot) return;

	const perms = message.channel.type === 'text' ? message.channel.permissionsFor(client.user) : true;

	if (!perms) return;

	const userId = message.author.id;
	const id = message.id + ', ' + userId;
	const mention = client.user.toString() + ' ';
	const text = message.content.replace(/\s{2,}/g, ' ');
	const m = text.match(/^[\t ]*\b(n|na|e|eu|r|ru|a|asia)\b/i);

	let start = 0;
	let region;

	if (m) {
		start = m.index + m[1].length + 1;
		region = m[1].toLowerCase();

		if (region in regionLetter) {
			region = regionLetter[region];
		}
	} else {
		region = new Promise((resolve, reject) => {
			master.findOne({_id: userId}, (error, record) => {
				if (error) return reject(error);

				resolve((record && record.region) || auth.wotblitz.default_region || 'na');
			});
		});
	}

	if (message.channel.type !== 'dm') {
		start = text.indexOf(mention);

		if (start < 0) return;

		start += mention.length;
	}

	let end = text.indexOf(' ', start);

	if (end < 0) end = text.length;
	if (end <= start) return; // no command at all

	const command = Commands.get(text.slice(start, end));

	if (command === null) return;
	// when the command is not "help" and this is a text channel, check for write privledges
	if (command !== 'help' && perms !== true && !perms.has('SEND_MESSAGES')) return;

	Promise.resolve(region).then(settledRegion => {
		const commands = regions[settledRegion];
		const db = commands.db;
		const {argCount, argSplit, passRecord} = commands[command].options;
		const textArgs = text.slice(end).trim();
		const args = textArgs && argCount > 0 ? textArgs.split(argSplit).slice(0, argCount) : [];

		let run;

		console.log(id + ' -- running command: "' + command + '"');

		if (passRecord) {
			run = new Promise((resolve, reject) => {
				db.findOne({_id: userId}, (error, record) => {
					if (error) return reject(error);

					// commands require a saved 'account_id'.
					if (record && record.account_id) {
						resolve(commands[command](message, record, ...args));
					} else {
						resolve(message.reply('I don\'t know who you are! Do `@' + client.user.username + ' add <screen-name>` first.')
							.then(sent => {
								console.log(id + ' -- sent msg: ' + sent);

								return null;
							}));
					}
				});
			});
		} else {
			run = commands[command](message, ...args);
		}

		return Promise.all([run, db]);
	}).then(([result, db]) => {
		if (!result) return;

		console.log(id + ' -- sent msg: ' + helpers.messageToString(result.sentMsg));

		const update = result.updateFields;

		if (!update) return;
		if (result.master) {
			db = master;
		}

		console.log(id + ' -- update document ' + db.filename);

		// add '_id' and remove 'updatedAt' so that upserting works every time, safely.
		update._id = userId;
		delete update.updatedAt;

		return new Promise((resolve, reject) => {
			db.update({_id: userId}, {$set: update}, {upsert: true}, error => {
				if (error) return reject(error);
				resolve();
			});
		});
	}).then(() => {
		console.log(id + ' -- done: ' + command);
	}).catch(error => {
		console.error(id + ' -- error: ' + command);

		if (!error) return console.log(id + ' -- error: Unknown');

		console.error(helpers.getFieldByPath(error, 'response.error.text') || error.stack || error);
	});
});

function loadDatabase(commands) {
	return new Promise((resolve, reject) => {
		commands.db.loadDatabase(error => {
			if (error) return reject(error);
			resolve();
		});
	});
}

Promise.all([
	loadDatabase(regions.na),
	loadDatabase(regions.eu),
	loadDatabase(regions.ru),
	loadDatabase(regions.asia),
	loadDatabase({db: master}),
	client.login(auth.user.token)
]).then(() => {
	// not using a promise because this server is event based, not assuming any event occurs only once
	serveReferences(Object.assign({bot: client}, regions), 8008, serverErr => {
		if (serverErr) return console.error(serverErr.stack || serverErr);
	});
}, error => {
	console.error(helpers.getFieldByPath(error, 'response.error.text') || error.stack || error);
});
