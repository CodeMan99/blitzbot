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

client.on('ready', function() {
  console.log('blitzbot ready!');
  console.log('===============');
});

client.on('message', function(message) {
  if (!message.isMentioned(client.user)) return;

  var text = message.cleanContent;
  var userId = message.author.id;

  async.auto({
    record: function(cb) { db.findOne({_id: userId}, cb); },
    defaultMsg: ['record', function(cb, d) {
      if (d.record) return cb(null);
      client.reply(message, "I don't know who you are! Do `@blitzbot add <blitz-username>` first.", {}, cb);
    }],
  }, function(err, data) {
    if (err) return console.error(helpers.getFieldByPath(err, 'response.error.text') || err.stack || err);
  });
});

async.auto({
  loadDb: function(cb) { db.loadDatabase(cb); },
  discordLogin: function(cb) { client.loginWithToken(auth.user.token, null, null, cb); },
}, function(err, data) {
  if (err) return console.error(helpers.getFieldByPath(err, 'response.error.text') || err.stack || err);
});
