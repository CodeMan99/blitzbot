const test = require('tape');
const mockery = require('mockery');
const mocks = require('./mocks');

mockery.registerAllowable('./index.js');
mockery.registerAllowable('../lib/command/donate.js');
mockery.registerMock('../../blitzbot.json', {
	paypal: {
		me: 'https://paypal.me/CodeMan99'
	}
});
mockery.enable();

const donate = require('../lib/command/donate.js');

mockery.disable();
mockery.deregisterAll();

const callDonate = donate.fn.bind(mocks.commands);

test('donate', t => {
	t.deepEqual(donate.fn.options, {
		argCount: 0,
		argSplit: ' ',
		description: 'Get a link to generously donate via paypal.',
		passRecord: false,
		signatures: ['@BOTNAME donate']
	}, 'verify options');

	t.equal(donate.name, 'donate', 'verify Commands method name');

	t.test('command', st => {
		callDonate(mocks.createMessage(null, 'NiceDude [CL]')).then(result => {
			const link = result.sentMsg.split(' ').slice(-1)[0];

			st.equal(link, 'https://paypal.me/CodeMan99', 'link is at the end of reply');
			st.end();
		}, error => { st.fail(error); st.end(); });
	});

	t.end();
});
