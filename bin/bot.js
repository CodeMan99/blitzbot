#!/usr/bin/env node

var Commands = require('../lib/command').Commands;
var Datastore = require('nedb');
var Discord = require('discord.js');
var auth = require('../blitzbot.json');
var helpers = require('../lib/helpers.js');
var pkg = require('../package.json');
var serveReferences = require('../lib/serveReferences.js');
var wotblitz = require('wotblitz');

(() => { // Add commands scope, no need to pollute module scope.
	var add = require('../lib/command/add.js');
	var createHelp = require('../lib/command').createHelp;
	var devel = require('../lib/command/development.js');
	var donate = require('../lib/command/donate.js');
	var greet = require('../lib/command/greet.js');
	var masteryList = require('../lib/command/masteryList.js');
	var maxXp = require('../lib/command/maxXp.js');
	var roster = require('../lib/command/roster.js');
	var wr = require('../lib/command/winRate.js');

	Commands.add(add);
	Commands.add(devel.changes);
	Commands.add(donate);
	Commands.add(devel.version);
	Commands.add(greet.hello);
	Commands.add(greet.hi);
	Commands.add(masteryList);
	Commands.add(maxXp);
	Commands.add(roster);
	Commands.add(wr.winRate);
	Commands.add(wr.tankWinRate);
	Commands.add(createHelp());
})();

var client = new Discord.Client();
var createDatabase = name => new Datastore({filename: './blitzbot' + name + '.db', timestampData: true});
var regions = {
	na: new Commands(client, createDatabase(''), wotblitz(auth.wotblitz.key, wotblitz.REGION_NA)),
	eu: new Commands(client, createDatabase('-eu'), wotblitz(auth.wotblitz.key, wotblitz.REGION_EU)),
	ru: new Commands(client, createDatabase('-ru'), wotblitz(auth.wotblitz.key, wotblitz.REGION_RU)),
	asia: new Commands(client, createDatabase('-asia'), wotblitz(auth.wotblitz.key, wotblitz.REGION_ASIA))
};
var regionLetter = {
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
	if (message.author.id === client.user.id) return;

	var perms = message.channel.type === 'text' ? message.channel.permissionsFor(client.user) : true;

	if (!perms) return;

	var mention = client.user.toString() + ' ';
	var region = auth.wotblitz.default_region || 'na';
	var start = 0;
	var text = message.content.replace(/\s{2,}/g, ' ');
	var m = text.match(/\b(n|na|e|eu|r|ru|a|asia)\b/i);

	if (m) {
		start = m.index + m[1].length + 1;
		region = m[1].toLowerCase();

		if (region in regionLetter) {
			region = regionLetter[region];
		}
	}

	if (message.channel.type !== 'dm') {
		start = text.indexOf(mention);

		if (start < 0) return;

		start += mention.length;
	}

	var end = text.indexOf(' ', start);

	if (end < 0) end = text.length;
	if (end <= start) return; // no command at all

	var command = text.slice(start, end);

	// when the command is not "help" and this is a text channel, check for write privledges
	if (command !== 'help' && perms !== true && !perms.has('SEND_MESSAGES')) return;
	if (!Commands.has(command)) return;

	var userId = message.author.id;
	var id = message.id + ', ' + userId;
	var commands = regions[region];
	var db = commands.db;
	var options = commands[command].options;
	var textArgs = text.slice(end).trim();
	var chain = [message];

	console.log(id + ' -- running command: "' + command + '"');

	if (options.passRecord) {
		chain.push(new Promise((resolve, reject) => {
			db.findOne({_id: userId}, (error, record) => {
				if (error) return reject(error);
				resolve(record);
			});
		}).then(record => {
			// commands require a saved 'account_id'.
			if (record && record.account_id) {
				return record;
			} else {
				return message.reply('I don\'t know who you are! Do `' + mention + 'add <screen-name>` first.').then(sent => {
					console.log(id + ' -- sent msg: ' + sent);

					return Promise.reject(null);
				});
			}
		}));
	}

	Promise.all(chain).then(args => {
		if (textArgs && options.argCount > 0) {
			Array.prototype.push.apply(args, textArgs.split(options.argSplit).slice(0, options.argCount));
		}

		return Commands.prototype[command].apply(commands, args);
	}).then(result => {
		if (!result) return;

		console.log(id + ' -- sent msg: ' + helpers.messageToString(result.sentMsg));

		var update = result.updateFields;

		if (!update) return;

		console.log(id + ' -- update document');

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
		// some promises reject without an error
		if (!error) return console.log(id + ' -- done: ' + command);

		console.error(id + ' -- error: ' + command);
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
	client.login(auth.user.token)
]).then(() => {
	// not using a promise because this server is event based, not assuming any event occurs only once
	serveReferences(Object.assign({bot: client}, regions), 8008, serverErr => {
		if (serverErr) return console.error(serverErr.stack || serverErr);
	});
}, error => {
	console.error(helpers.getFieldByPath(error, 'response.error.text') || error.stack || error);
});
