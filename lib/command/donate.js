var Command = require('./index.js').Command;
var auth = require('../../blitzbot.json');
var donateOptions = {
	description: 'Get a link to generously donate via paypal.',
	signatures: ['@BOTNAME donate']
};
var phrases = [
	'Thanks for your interest!',
	'Your donation is greatly appreciated!',
	'Most high gratitude!',
	'You will be remembered compassionately!',
	'Pinky promise to spend it on beer :)',
	'Hype fund!',
	'Hooray, cookies!',
	'More tanks for me!',
	'Tank loot inbound!',
	'Many thank, mortal.',
	'One small step for technology, one giant leap for Skynet.',
	'1.21 gigawatts?! 1.21 gigawatts?! Great Scott!',
	'Shark still looks fake.',
	'Marty! What in the name of Sir Isaac H. Newton happened here?',
	'It\'s a science experiment! Stop the train just before you hit the switch track up ahead!',
	'Come with me if you want to live!',
	'Yeah. I have to stay functional too. I\'m "too important".',
	'We got Skynet by the balls now, don\'t we?',
	'Hey, laser lips, your mama was a snow blower.',
	'Malfunction. Need input.',
	'Number 5: No, no, please. No autographs, sir!'
];

module.exports = new Command(donate, donateOptions, 'donate');

function donate(msg) {
	var index = Math.floor(Math.random() * phrases.length);

	return msg.reply(`${phrases[index]} ${auth.paypal.me}`).then(sent => {
		return {sentMsg: sent};
	});
}
