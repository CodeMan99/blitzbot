const test = require('tape');
const {autoEndTest} = require('./.utility.js');
const mocks = require('./mocks');
const greet = require('../lib/command/greet.js');
const callHello = greet.hello.fn.bind(mocks.commands);

test('greet.hello', t => {
	t.deepEqual(greet.hello.fn.options, {
		alias: 'hi',
		argCount: 0,
		argSplit: ' ',
		description: 'Just saying hello.',
		passRecord: false,
		signatures: [
			'@BOTNAME hello',
			'@BOTNAME hi'
		]
	}, 'verify options');

	t.equal(greet.hello.name, 'hello', 'verify Commands method name');

	t.test('greet.hello call', autoEndTest(async st => {
		const result = await callHello(mocks.createMessage(null, 'zack32'));

		st.deepEqual(result, {sentMsg: '@zack32, Hello! Try saying `@testbot help` to learn about me'}, 'valid response');
	}));

	t.end();
});
