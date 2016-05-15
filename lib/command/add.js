var Command = require('./index.js').Command;
var wotblitz = require('wotblitz');
var options = {
  argCount: 1,
  description: 'Associate your blitz username with discord.',
  signatures: ['@BOTNAME add <blitz-username>'],
};

module.exports = new Command(add, options, 'add');

function add(msg, username) {
  if (!username) {
    return this.client.reply(msg, 'You must specify your Blitz username. Do *not* include the clan tag.').then(sent => {
      console.log('sent msg: ' + sent);

      return Promise.resolve();
    });
  }

  username = username.toLowerCase();

  var p = new Promise((resolve, reject) => {
    wotblitz.player.list(username, null, (err, list) => {
      if (err) return reject(err);

      var player = list.find(a => a.toLowerCase() === username);
      var text;

      if (player) {
        text = 'Welcome! You now have access to all commands. :)';
      } else {
        text = 'No Blitz account found for `' + username + '`...';
      }

      this.client.reply(msg, text).then(sent => {
        console.log('sent msg: ' + sent);

        resolve(player || null);
      }, reject);
    });
  });

  return p;
}
