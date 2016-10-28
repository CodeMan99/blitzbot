var test = require('tape');
var mocks = require('./mocks');
var greet = require('../lib/command/greet.js');
var callHi = greet.hi.fn.bind(mocks.commands);
var callHello = greet.hello.fn.bind(mocks.commands);

test('greet.hi', t => {
	t.deepEqual(greet.hi.fn.options, {
		argCount: 0,
		argSplit: ' ',
		description: 'Just saying hello.',
		passRecord: false,
		signatures: ['@BOTNAME hi']
	}, 'verify options');

	t.equal(greet.hi.name, 'hi', 'verify Commands method name');

	t.test('valid call', st => {
		callHi(mocks.createMessage(null, 'bob1')).then(result => {
			st.deepEqual(result, {sentMsg: '@bob1, Hello! Try saying `@testbot help` to learn about me'}, 'valid response');
			st.end();
		}, error => { st.fail(error); st.end(); });
	});

	t.end();
});

test('greet.hello', t => {
	t.deepEqual(greet.hello.fn.options, {
		argCount: 0,
		argSplit: ' ',
		description: 'Just saying hello.',
		passRecord: false,
		signatures: ['@BOTNAME hello']
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
