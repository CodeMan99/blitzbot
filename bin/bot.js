#!/usr/bin/env node

var Datastore = require('nedb');
var Discord = require('discord.js');
var async = require('async');
var auth = require('../blitzbot.json');
var helpers = require('../lib/helpers.js');
var wotblitz = require('wotblitz')('48fe1a85faacb26a079a627f8483cb6f');

var client = new Discord.Client();
var db = new Datastore({
  filename: './blitzbot.db',
  timestampData: true,
});

var commands = {};

commands.add = {
  'args': 1,
  'description': 'Associate your blitz screenname with discord.',
  'fn': function(msg, screenname, cb) {
    screenname = screenname.toLowerCase();

    wotblitz.players.list(screenname, null, function(pErr, players) {
      if (pErr) return cb(pErr);

      var player = players.find(function(p) { return p.nickname.toLowerCase() === screenname; });

      if (player) {
        client.reply(msg, 'Welcome! You now have access to all commands. :)', {}, function(rErr, sent) {
          if (rErr) return cb(rErr);

          console.log('sent msg: ' + sent);
          cb(null, player);
        });
      } else {
        // this could be an error, but for now avoid the noise
        cb(null);
      }
    });
  },
  'passRecord': false,
  'signatures': ['@blitzbot add <screenname>'],
};

commands.wr = {
  'args': 0,
  'description': 'Get the win rate of your account.',
  'fn': function(msg, record, cb) {
    wotblitz.players.info([record.account_id], [], ['statistics.all.battles', 'statistics.all.wins'], null, function(iErr, info) {
      if (iErr) return cb(iErr);

      var wins = info[record.account_id].statistics.all.wins;
      var battles = info[record.account_id].statistics.all.battles;
      var percent = (wins / battles) * 100;

      client.reply(msg, 'You have won ' + wins + ' of ' + battles + ' battles. That is ' + percent.toFixed(2) + '% victory!', {}, function(rErr, sent) {
        if (rErr) return cb(rErr);

        console.log('sent msg: ' + sent);

        record.wins = wins;
        record.battles = battles;

        cb(null, record);
      });
    });
  },
  'passRecord': true,
  'signatures': ['@blitzbot wr'],
};

commands.help = {
  'args': 1,
  'description': 'List all known commands or get help for a particular command.',
  'fn': null,
  'passRecord': false,
  'signatures': [
    '@blitzbot help [command]',
    '(direct message): help [command]',
  ],
};

// done last so that the help function can read the entire "commands" structure
commands.help.fn = function(msg, helpFor, cb) {
  if (typeof helpFor === 'function') {
    cb = helpFor;
    helpFor = null;
  }

  var lines = [];
  var push = function(key) {
    commands[key].signatures.forEach(function(signature) {
      lines.push('`' + signature + '` -- ' + commands[key].description);
    });
  }

  if (helpFor) {
    if (helpFor in commands) {
      push(helpFor)
    } else {
      lines.push('Unknown command: ' + helpFor);
    }
  } else {
    Object.keys(commands).forEach(push);
  }

  async.each(lines, function(send, callback) {
    client.sendMessage(msg.author, send, {}, callback);
  }, function(err) {
    if (err) return cb(err);

    cb(null);
  });
};
  

client.on('ready', function() {
  console.log('blitzbot ready!');
  console.log('===============');
});

client.on('message', function(message) {
  // Bot will only respond in a DM or when mentioned.
  if (!message.channel.isPrivate && !message.isMentioned(client.user)) return;
  if (message.author.id === client.user.id) return;

  var userId = message.author.id;
  var text = message.cleanContent.split(' ');
  var i = text.findIndex(function(e, i, a) {
    return (message.channel.isPrivate && e === 'help') || (i > 0 && a[i - 1] === '@' + client.user.username);
  });
  var command = text[i];
  var args = text.slice(i + 1);

  if (!(command in commands)) return;

  async.auto({
    record: function(cb) { db.findOne({_id: userId}, cb); },
    runCmd: ['record', function(cb, d) {
      console.log(userId + ' -- running command: "' + command + '"');

      var obj = commands[command];
      var arr = [message];

      if (obj.passRecord) {
        // commands require a saved 'account_id'.
        if (d.record && d.record.account_id) {
          arr.push(d.record);
        } else {
          return client.reply(message, "I don't know who you are! Do `@blitzbot add <screenname>` first.", {}, function(aErr) {
            if (aErr) return cb(aErr);

            cb(null);
          });
        }
      }

      if (obj.args > 0) Array.prototype.push.apply(arr, args.slice(0, obj.args));
      arr.push(cb);

      obj.fn.apply(null, arr);
    }],
    update: ['runCmd', function(cb, d) {
      if (!d.runCmd) return cb(null);

      console.log(userId + ' -- update document');

      var newRecord = d.runCmd;
      newRecord._id = userId;
      delete newRecord.updatedAt;

      db.update({_id: userId}, newRecord, {upsert: true}, cb);
    }],
  }, function(err, data) {
    if (err) return console.error(helpers.getFieldByPath(err, 'response.error.text') || err.stack || err);

    console.log(userId + ' -- done');
  });
});

async.auto({
  loadDb: function(cb) { db.loadDatabase(cb); },
  discordLogin: function(cb) { client.loginWithToken(auth.user.token, null, null, cb); },
}, function(err, data) {
  if (err) return console.error(helpers.getFieldByPath(err, 'response.error.text') || err.stack || err);
});
