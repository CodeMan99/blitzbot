var test = require('tape');
var mocks = require('./mocks');
var greet = require('../lib/command/greet.js');
var callHello = greet.hello.fn.bind(mocks.commands);

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

	t.test('greet.hello call', st => {
		callHello(mocks.createMessage(null, 'zack32')).then(result => {
			st.deepEqual(result, {sentMsg: '@zack32, Hello! Try saying `@testbot help` to learn about me'}, 'valid response');
			st.end();
		}, error => { st.fail(error); st.end(); });
	});

	t.end();
});
