const test = require('tape');
const mockery = require('mockery');
const {autoEndTest} = require('./.utility.js');
const mocks = require('./mocks');

mockery.registerAllowable('./index.js');
mockery.registerAllowable('../lib/command/development.js');
mockery.registerMock('../../package.json', {
	name: 'testname',
	version: '1.3.4'
});
mockery.registerMock('../../change-log.json', {
	'1.3.4': [
		'change 2',
		'change 1'
	],
	'1.3.3': [
		'fix 2',
		'fix 1'
	]
});
mockery.enable();

const dev = require('../lib/command/development.js');

mockery.disable();
mockery.deregisterAll();

const callChanges = dev.changes.fn.bind(mocks.commands);
const callVersion = dev.version.fn.bind(mocks.commands);

test('development.changes', t => {
	t.deepEqual(dev.changes.fn.options, {
		argCount: 1,
		argSplit: ' ',
		description: 'Get the update notes from the author (defaults to the current version).',
		passRecord: false,
		signatures: ['@BOTNAME changes [version]']
	}, 'verify options');

	t.equal(dev.changes.name, 'changes', 'verify Commands method name');

	t.test('no version argument', autoEndTest(async st => {
		const result = await callChanges(mocks.createMessage(null, 'bill32'));

		st.deepEqual(result, {
			sentMsg: [
				'@bill32, Change Log for `testname`, version **1.3.4**.',
				'change 2',
				'change 1'
			].join('\n')
		}, 'sent message about current version');
	}));

	t.test('valid version argument', autoEndTest(async st => {
		const result = await callChanges(mocks.createMessage(null, 'greg14'), '1.3.3');

		st.deepEqual(result, {
			sentMsg: [
				'@greg14, Change Log for `testname`, version **1.3.3**.',
				'fix 2',
				'fix 1'
			].join('\n')
		}, 'sent message about specifed version');
	}));

	t.test('invalid version argument', autoEndTest(async st => {
		const result = await callChanges(mocks.createMessage(null, 'jack81'), '1.3.5');

		st.notOk(result, 'no response without error');
	}));

	t.end();
});

test('development.version', t => {
	t.deepEqual(dev.version.fn.options, {
		argCount: 0,
		argSplit: ' ',
		description: 'Replies the current blitzbot version.',
		passRecord: false,
		signatures: ['@BOTNAME version']
	}, 'verify options');

	t.equal(dev.changes.name, 'changes', 'verify Commands method name');

	t.test('valid call', autoEndTest(async st => {
		const result = await callVersion(mocks.createMessage(null, 'joe65'));

		st.deepEqual(result, {
			sentMsg: '@joe65, testname version 1.3.4, written by <@86558039594774528>'
		}, 'valid response.');
	}));

	t.end();
});
