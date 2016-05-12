#!/usr/bin/env node

var Datastore = require('nedb');
var Discord = require('discord.js');
var async = require('async');
var auth = require('../blitzbot.json');
var pkg = require('../package.json');

// set WarGaming API key, so require does not return an init function
process.env.APPLICATION_ID = '48fe1a85faacb26a079a627f8483cb6f';

var helpers = require('../lib/helpers.js');
var wotblitz = require('wotblitz');

var client = new Discord.Client({
  autoReconnect: true,
});
var db = new Datastore({
  filename: './blitzbot.db',
  timestampData: true,
});

var commands = {};

commands.add = {
  'args': 1,
  'description': 'Associate your blitz screen-name with discord.',
  'fn': function(msg, screenname, cb) {
    if (typeof screenname === 'function') {
      cb = screenname;
      return client.reply(msg, 'You must specify your blitz screen-name. Do *not* include the tag.', {}, function(err, sent) {
        if (err) return cb(null);

        console.log('sent msg: ' + sent);
        cb(null);
      });
    }

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
  'signatures': ['@blitzbot add <screen-name>'],
};

commands.changes = {
  'args': 1,
  'description': 'Get the update notes from the author (defaults to current version).',
  'fn': function(msg, version, cb) {
    if (typeof version === 'function') {
      cb = version;
      version = pkg.version;
    }

    if (!(version in pkg.changeLog)) return;

    var lines = ['Change Log for `' + pkg.name + '`, version **' + version + '**.'].concat(pkg.changeLog[version]);

    client.reply(msg, lines.join('\n'), {}, function(err, sent) {
      if (err) return cb(err);

      console.log('sent msg: ' + sent);
      cb(null);
    });
  },
  'passRecord': false,
  'signatures': ['@blitzbot changes [version]'],
};

commands.hello = {
  'args': 0,
  'description': 'Just saying hello.',
  'fn': function(msg, cb) {
    client.reply(msg, 'Hello! Try saying `@blitzbot help` to learn about me.', {}, function(err, sent) {
      if (err) return cb(err);

      console.log('sent msg: ' + sent);
      cb(null);
    });
  },
  'passRecord': false,
};
commands.hi = Object.assign({}, commands.hello);
commands.hello.signatures = ['@blitz hello'];
commands.hi.signatures = ['@blitz hi'];

commands.masteryList = {
  'args': 2,
  'description': 'List tanks at the given mastery level, sorted by battle count (default: "Mastery").',
  'fn': function(msg, record, name1, name2, cb) {
    var name;

    if (typeof name1 === 'function') {
      cb = name1;
      name = 'mastery';
    } else if (typeof name2 ===  'function') {
      cb = name2;
      name = name1.toLowerCase();
    } else {
      name = name1.toLowerCase() + ' ' + name2.toLowerCase();
    }

    var level = ['3rd class', '2nd class', '1st class', 'mastery'].findIndex(function(l) {
      return l === name || l.startsWith(name);
    }) + 1;
    var fields = ['mark_of_mastery', 'tank_id', 'all.battles'];

    if (level < 1) return cb(null);

    wotblitz.tankStats.stats(record.account_id, [], null, fields, null, function(sErr, stats) {
      if (sErr) return cb(sErr);

      var tankIds = stats[record.account_id]
        .filter(function(s) { return s.mark_of_mastery === level; })
        .sort(function(a, b) { return a.all.battles - b.all.battles; })
        .map(function(s) { return s.tank_id; });
      var limit = 100;
      var chunked = [];

      if (tankIds.length === 0) {
        client.reply(msg, 'I did *not* find any tanks at "' + name + '!', {}, function(rErr, sent) {
          if (rErr) return cb(rErr);

          console.log('sent msg: ' + sent);
          cb(null);
        });
      }

      for (var i = 0; i < tankIds.length; i += limit) {
        chunked.push(tankIds.slice(i, i + limit));
      }

      fields = ['name', 'tier', 'nation'];
      async.map(chunked, function(tankIdsChunk, mapCb) {
        wotblitz.tankopedia.vehicles(tankIdsChunk, [], fields, mapCb);
      }, function(mErr, chunkedData) {
        if (mErr) return cb(mErr);

        var data = chunkedData.reduce(function(memo, obj) {
          Object.keys(obj).forEach(function(k) { memo[k] = obj[k]; });
          return memo;
        }, {});
        var text = Object.keys(data)
          .sort(function(a, b) { return tankIds.indexOf(Number(a)) - tankIds.indexOf(Number(b)); })
          .map(function(id) { return data[id].name + ' (' + data[id].nation + ', ' + data[id].tier + ')'; })
          .join(' ; ');

        client.reply(msg, text, {}, function(rErr1, sent1) {
          if (rErr1) return cb(rErr1);

          console.log('sent msg: ' + sent1);
          cb(null);
        });
      });
    });
  },
  'passRecord': true,
  'signatures': ['@blitzbot mastery-list [level]'],
};

commands.roster = {
  'args': 1,
  'description': 'List a clan roster. Defaults to your clan if none specified.',
  'fn': function(msg, record, tag, cb) {
    if (typeof tag === 'function') {
      cb = tag;
      tag = null;
    }

    var doRoster = function(clan_id) {
      wotblitz.clans.info([clan_id], ['members'], ['name', 'members'], null, function(iErr, info) {
        if (iErr) return cb(iErr);

        var members = info[clan_id].members;
        var roleOrder = Array.prototype.indexOf.bind(['commander', 'executive_officer', 'private']);
        var roleStyle = {commander: /* bold */ '**', executive_officer: /* italics */ '*', private: null};
        var names = Object.keys(members)
          .map(function(id) { return members[id]; })
          .sort(helpers.sortBy({name: 'role', primer: roleOrder}, 'joined_at'))
          .map(function(member) {
            var style = roleStyle[member.role];

            return [style, member.account_name.replace(/([*_~])/g, '\\$1'), style].join('');
          });
        var text = 'The roster for `' + info[clan_id].name + '` is: ' + names.join(', ');

        client.reply(msg, text, {}, function(rErr, sent) {
          if (rErr) return cb(rErr);

          console.log('sent msg: ' + sent);
          cb(null);
        });
      });
    };

    if (tag) {
      tag = tag.toUpperCase();

      // if a tag does not follow the rules
      if (!tag.match(/^[A-Z0-9-_]{2,5}$/)) return cb(null);

      wotblitz.clans.list(tag, null, 1, ['clan_id', 'tag'], null, function(lErr, list) {
        if (lErr) return cb(lErr);

        var result = list.find(function(clan) {
          return clan.tag === tag;
        });

        if (!result) return cb(null);

        doRoster(result.clan_id);
      });
    } else {
      wotblitz.clans.accountinfo([record.account_id], [], ['clan_id'], null, function(aErr, accountinfo) {
        if (aErr) return cb(aErr);

        doRoster(accountinfo[record.account_id].clan_id);
      });
    }
  },
  'passRecord': true,
  'signatures': ['@blitzbot roster [clan-tag]'],
};

commands.tankWinRate = {
  'args': 1,
  'description': 'Get your win rate on the given tank (replace spaces with dashes).',
  'fn': function(msg, record, tankName, cb) {
    if (typeof tankName === 'function') {
      cb = tankName;
      return client.reply(msg, 'No tank specified.', {}, function(err, sent) {
        if (err) return cb(err);

        console.log('sent msg: ' + sent);
        cb(null);
      });
    }

    var fields = ['name', 'nation', 'tier'];

    tankName = tankName.replace(/-/g, ' ').toLowerCase();

    wotblitz.tankopedia.vehicles(null, [], fields, function(vErr, tanks) {
      if (vErr) return cb(vErr);

      var tankIds = Object.keys(tanks).filter(function(id) {
        // this is not good enough, WarGaming is not very careful about giving tank unique names
        return tanks[id].name.toLowerCase().indexOf(tankName) > -1;
      });

      if (tankIds.length < 1) return cb(null);
      if (tankIds.length > 100) {
        return client.reply(msg, 'Found too many vehicles with `' + tankName + '`.', {}, function(rErr, sent) {
          if (rErr) return cb(rErr);

          console.log('sent msg: ' + sent);
          cb(null);
        });
      }

      fields = ['tank_id', 'all.battles', 'all.wins'];

      wotblitz.tankStats.stats(Number(record.account_id), tankIds, null, fields, null, function(sErr, stats) {
        if (sErr) return cb(sErr);

        var lines = stats[record.account_id].map(function(stat) {
          var tankopedia = tanks[stat.tank_id];
          var winRate = (stat.all.wins / stat.all.battles) * 100;

          return tankopedia.name + ' (' + tankopedia.nation + ', ' + tankopedia.tier + '): ' +
            winRate.toFixed(2) + '% after ' + stat.all.battles + ' battles.';
        });

        client.reply(msg, lines.join('\n'), {}, function(rErr, sent) {
          if (rErr) return cb(rErr);

          console.log('sent msg: ' + sent);
          cb(null);
        });
      });
    });
  },
  'passRecord': true,
  'signatures': ['@blitzbot tank-win-rate <tank-name>'],
};

commands.version = {
  'args': 0,
  'description': 'Replies the current blitzbot version.',
  'fn': function(msg, cb) {
    var text = pkg.name + ' version ' + pkg.version + ', written by <@86558039594774528>';

    client.sendMessage(msg, text, {}, function(err, sent) {
      if (err) return cb(err);

      console.log('sent msg: ' + sent);
      cb(null);
    });
  },
  'passRecord': false,
  'signatures': ['@blitzbot version'],
};

commands.winRate = {
  'args': 0,
  'description': 'Get the win rate of your account.',
  'fn': function(msg, record, cb) {
    var fields = ['statistics.all.battles', 'statistics.all.wins'];

    wotblitz.players.info([record.account_id], [], fields, null, function(iErr, info) {
      if (iErr) return cb(iErr);

      var wins = info[record.account_id].statistics.all.wins;
      var battles = info[record.account_id].statistics.all.battles;
      var percent = (wins / battles) * 100;
      var send = 'You have won ' + wins + ' of ' + battles + ' battles. That is ' + percent.toFixed(2) + '% victory!';

      client.reply(msg, send, {}, function(rErr, sent) {
        if (rErr) return cb(rErr);

        console.log('sent msg: ' + sent);

        record.wins = wins;
        record.battles = battles;

        cb(null, record);
      });
    });
  },
  'passRecord': true,
  'signatures': ['@blitzbot win-rate'],
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
  };

  if (helpFor) {
    if (helpFor in commands) {
      push(helpFor);
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
  var index = text.findIndex(function(e, i, a) {
    return (message.channel.isPrivate && e === 'help') || (i > 0 && a[i - 1] === '@' + client.user.username);
  });

  if (index < 0) return;

  // force command to camelcase
  var command = text[index].toLowerCase().replace(/-[a-z]/g, function(m) { return m[1].toUpperCase(); });
  var args = text.slice(index + 1);

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
          var send = "I don't know who you are! Do `@blitzbot add <screen-name>` first.";

          return client.reply(message, send, {}, function(aErr, sent) {
            if (aErr) return cb(aErr);

            console.log('sent msg: ' + sent);
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
  }, function(err) {
    if (err) return console.error(helpers.getFieldByPath(err, 'response.error.text') || err.stack || err);

    console.log(userId + ' -- done');
  });
});

async.auto({
  loadDb: function(cb) { db.loadDatabase(cb); },
  discordLogin: function(cb) { client.loginWithToken(auth.user.token, null, null, cb); },
}, function(err) {
  if (err) return console.error(helpers.getFieldByPath(err, 'response.error.text') || err.stack || err);
});
