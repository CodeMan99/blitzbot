#!/usr/bin/env node

var Datastore = require('nedb');
var Discord = require('discord.js');
var async = require('async');
var auth = require('../blitzbot.json');
var pkg = require('../package.json');

// set WarGaming API key, so require does not return an init function
process.env.APPLICATION_ID = auth.wotblitz.key;

var Commands = require('../lib/command').Commands;
var helpers = require('../lib/helpers.js');

(() => { // Add commands scope, no need to pollute module scope.
  var add = require('../lib/command/add.js');
  var createHelp = require('../lib/command').createHelp;
  var devel = require('../lib/command/development.js');
  var donate = require('../lib/command/donate.js');
  var greet = require('../lib/command/greet.js');
  var masteryList = require('../lib/command/masteryList.js');
  var roster = require('../lib/command/roster.js');
  var wr = require('../lib/command/winRate.js');

  Commands.add(add);
  Commands.add(devel.changes);
  Commands.add(donate);
  Commands.add(devel.version);
  Commands.add(greet.hello);
  Commands.add(greet.hi);
  Commands.add(masteryList);
  Commands.add(roster);
  Commands.add(wr.winRate);
  Commands.add(wr.tankWinRate);
  Commands.add(createHelp());
})();

var client = new Discord.Client({
  autoReconnect: true,
});
var db = new Datastore({
  filename: './blitzbot.db',
  timestampData: true,
});
var commands = new Commands(client, db);

client.userAgent = {url: pkg.homepage, version: pkg.version};

client.on('ready', () => {
  console.log('blitzbot ready!');
  console.log('===============');
});

client.on('message', message => {
  // Bot will only respond in a DM or when mentioned.
  if (!message.channel.isPrivate && !message.isMentioned(client.user)) return;
  if (message.author.id === client.user.id) return;

  var userId = message.author.id;
  var text = message.cleanContent;
  var mention = `@${client.user.username} `;
  var start = 0;

  if (!message.channel.isPrivate) {
    start = text.indexOf(mention);

    if (start < 0) return;

    start += mention.length;
  }

  var end = text.indexOf(' ', start);

  if (end < 0) end = text.length;

  var command = text.slice(start, end);

  if (!Commands.has(command)) return;

  var options = commands[command].options;
  var textArgs = text.slice(end).trim();

  async.auto({
    record: cb => db.findOne({_id: userId}, cb),
    runCmd: ['record', (cb, d) => {
      console.log(userId + ' -- running command: "' + command + '"');

      var args = [message];

      if (options.passRecord) {
        // commands require a saved 'account_id'.
        if (d.record && d.record.account_id) {
          args.push(d.record);
        } else {
          var send = 'I don\'t know who you are! Do `' + mention + 'add <screen-name>` first.';

          client.reply(message, send).then(sent => {
            console.log('sent msg: ' + sent);
            cb(null);
          }, cb);

          return;
        }
      }

      if (textArgs && options.argCount > 0) {
        Array.prototype.push.apply(args, textArgs.split(options.argSplit).slice(0, options.argCount));
      }

      Commands.prototype[command].apply(commands, args).then(result => {
        if (!result) return cb(null);
        if (result.sentMsg) {
          if (Array.isArray(result.sentMsg)) result.sentMsg = result.sentMsg.join('\n');

          console.log('sent msg: ' + result.sentMsg);
        }

        cb(null, result.updateFields);
      }, cb);
    }],
    update: ['runCmd', (cb, d) => {
      if (!d.runCmd) return cb(null);

      console.log(userId + ' -- update document');

      var updateFields = d.runCmd;

      // add '_id' and remove 'updatedAt' so that upserting works every time, safely.
      updateFields._id = userId;
      delete updateFields.updatedAt;

      db.update({_id: userId}, {$set: updateFields}, {upsert: true}, cb);
    }],
  }, err => {
    if (err) {
      console.error(userId + ' -- ' + command);
      console.error(helpers.getFieldByPath(err, 'response.error.text') || err.stack || err);

      return;
    }

    console.log(userId + ' -- done');
  });
});

async.auto({
  loadDb: cb => db.loadDatabase(cb),
  discordLogin: cb => client.loginWithToken(auth.user.token, null, null, cb),
}, err => {
  if (err) return console.error(helpers.getFieldByPath(err, 'response.error.text') || err.stack || err);
});
