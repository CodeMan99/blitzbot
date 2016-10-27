var Command = require('./index.js').Command;
var options = {
	argCount: 0,
	description: 'Just saying hello.'
};
var helloCmd = new Command(greet, Object.assign(options, {signatures: ['@BOTNAME hello']}), 'hello');
var hiCmd = new Command(function() { // so options is not assigned to the same 'fn' instance
	return greet.apply(this, arguments);
}, Object.assign(options, {signatures: ['@BOTNAME hi']}), 'hi');

module.exports = {
	hello: helloCmd,
	hi: hiCmd
};

function greet(msg) {
	var botname = this.client.user.username;

	return this.client.reply(msg, 'Hello! Try saying `@' + botname + ' help` to learn about me').then(sent => {
		return {sentMsg: sent};
	});
}
