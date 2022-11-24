#!/usr/bin/env node

const {Commands} = require('../lib/command');
const Datastore = require('../lib/datastore.js');
const Discord = require('discord.js');
const auth = require('../blitzbot.json');
const helpers = require('../lib/helpers.js');
const pkg = require('../package.json');
const serveReferences = require('../lib/serveReferences.js');
const wotblitz = require('wotblitz');

{ // Add commands scope, no need to pollute module scope.
	const add = require('../lib/command/add.js');
	const {createHelp} = require('../lib/command');
	const {changes, version} = require('../lib/command/development.js');
	const donate = require('../lib/command/donate.js');
	const {hello} = require('../lib/command/greet.js');
	const masteryList = require('../lib/command/masteryList.js');
	const maxXp = require('../lib/command/maxXp.js');
	const roster = require('../lib/command/roster.js');
	const whoami = require('../lib/command/whoami.js');
	const setRegion = require('../lib/command/setRegion.js');
	const {winRate, tankWinRate} = require('../lib/command/winRate.js');

	Commands.add(add);
	Commands.add(changes);
	Commands.add(donate);
	Commands.add(version);
	Commands.add(hello);
	Commands.add(masteryList);
	Commands.add(maxXp);
	Commands.add(roster);
	Commands.add(whoami);
	Commands.add(setRegion);
	Commands.add(winRate);
	Commands.add(tankWinRate);
	Commands.add(createHelp());
}

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

client.on('ready', () => {
	console.log('blitzbot ready!');
	console.log('===============');
	console.error('blitzbot ready!');
	console.error('===============');
});

client.on('message', async (message) => {
	// Bot will only respond in a DM or when mentioned.
	if (message.channel.type !== 'dm' && !message.mentions.has(client.user)) return;
	if (message.author.id === client.user.id || message.author.bot) return;

	const perms = message.channel.type === 'text' ? message.channel.permissionsFor(client.user) : true;

	if (!perms) return;

	const userId = message.author.id;
	const id = message.id + ', ' + userId;
	const mentionRE = new RegExp(`<@!?${client.user.id}> `);
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
		region = master.findOne({_id: userId}).then(record => {
			return (record && record.region) || auth.wotblitz.default_region || 'na';
		});
	}

	if (message.channel.type !== 'dm') {
		const mention = text.match(mentionRE);

		if (!mention) return;

		start = mention.index + mention[0].length;
	}

	let end = text.indexOf(' ', start);

	if (end < 0) end = text.length;
	if (end <= start) return; // no command at all

	const command = Commands.get(text.slice(start, end));

	if (command === null) return;
	// when the command is not "help" and this is a text channel, check for write privledges
	if (command !== 'help' && perms !== true && !perms.has('SEND_MESSAGES')) return;

	try {
		const settledRegion = await Promise.resolve(region);
		const commands = regions[settledRegion];
		const db = commands.db;
		const {argCount, argSplit, passRecord} = commands[command].options;
		const textArgs = text.slice(end).trim();
		const args = textArgs && argCount > 0 ? textArgs.split(argSplit).slice(0, argCount) : [];

		console.log(id + ' -- running command: "' + command + '"');

		if (passRecord) {
			const record = await db.findOne({_id: userId});

			// commands require a saved 'account_id'.
			if (record && record.account_id) {
				args.unshift(record);
			} else {
				await message.reply('I don\'t know who you are! Do `@' + client.user.username + ' add <screen-name>` first.');

				return;
			}
		}

		const result = await commands[command](message, ...args);

		console.log(id + ' -- sent msg: ' + helpers.messageToString(result.sentMsg));

		if (result.updateFields) {
			const update = result.updateFields;

			// add '_id' and remove 'updatedAt' so that upserting works every time, safely.
			update._id = userId;
			delete update.updatedAt;

			if (result.master) {
				console.log(id + ' -- update document ' + master.filename);
				await master.update({_id: userId}, {$set: update}, {upsert: true});
			} else {
				console.log(id + ' -- update document ' + db.filename);
				await db.update({_id: userId}, {$set: update}, {upsert: true});
			}
		}
	} catch (error) {
		console.error(id + ' -- error: ' + command);

		if (!error) return console.log(id + ' -- error: Unknown');

		console.error(helpers.getFieldByPath(error, 'response.error.text') || error.stack || error);
	} finally {
		console.log(id + ' -- done: ' + command);
	}
});

Promise.all([
	regions.na.db.loadDatabase(),
	regions.eu.db.loadDatabase(),
	regions.ru.db.loadDatabase(),
	regions.asia.db.loadDatabase(),
	master.loadDatabase(),
	client.login(auth.user.token)
]).then(() => {
	const exposeReferences = {
		auth: auth,
		client: client,
		master: master,
		regions: regions
	};

	// not using a promise because this server is event based, not assuming any event occurs only once
	serveReferences(exposeReferences, 8008, serverErr => {
		if (serverErr) return console.error(serverErr.stack || serverErr);
	});
}, error => {
	console.error(helpers.getFieldByPath(error, 'response.error.text') || error.stack || error);
});
