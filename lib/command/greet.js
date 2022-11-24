const Command = require('./index.js').Command;
const options = {
	alias: 'hi',
	argCount: 0,
	description: 'Just saying hello.',
	signatures: [
		'@BOTNAME hello',
		'@BOTNAME hi'
	]
};
const helloCmd = new Command(greet, options, 'hello');

module.exports = {
	hello: helloCmd
};

async function greet(msg) {
	const botname = this.client.user.username;
	const sent = await msg.reply('Hello! Try saying `@' + botname + ' help` to learn about me');

	return {sentMsg: sent};
}
