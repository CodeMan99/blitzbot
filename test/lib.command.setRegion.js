var test = require('tape');
var mocks = require('./mocks');
var setRegion = require('../lib/command/setRegion.js');
var callSetRegion = (msg, region) => setRegion.fn.call(mocks.commands, msg, region);

test('command.setRegion', t => {
	t.deepEqual(setRegion.fn.options, {
		argCount: 1,
		argSplit: ' ',
		description: 'Update your personal default region.',
		passRecord: false,
		signatures: ['@BOTNAME set-region [region]']
	}, 'verify options');

	t.equal(setRegion.name, 'set-region', 'verify Commands method name');

	t.test('no argument', st => {
		var msg = mocks.createMessage(null, 'mark');
		var expected = {
			sentMsg: '@mark, Region set to "na".',
			master: true,
			updateFields: {
				region: 'na'
			}
		};

		callSetRegion(msg)
			.then(result => st.deepEqual(result, expected, 'sets the region "na"'), error => st.fail(error))
			.then(() => st.end());
	});

	t.test('set "na"', st => {
		var msg = mocks.createMessage(null, 'bill');
		var expected = {
			sentMsg: '@bill, Region set to "na".',
			master: true,
			updateFields: {
				region: 'na'
			}
		};

		callSetRegion(msg, 'na')
			.then(result => st.deepEqual(result, expected, 'sets the region "na"'), error => st.fail(error))
			.then(() => st.end());
	});

	t.test('set "n"', st => {
		var msg = mocks.createMessage(null, 'greg');
		var expected = {
			sentMsg: '@greg, Region set to "na".',
			master: true,
			updateFields: {
				region: 'na'
			}
		};

		callSetRegion(msg, 'n')
			.then(result => st.deepEqual(result, expected, 'sets the region "na"'), error => st.fail(error))
			.then(() => st.end());
	});

	t.test('set "eu"', st => {
		var msg = mocks.createMessage(null, 'wendy');
		var expected = {
			sentMsg: '@wendy, Region set to "eu".',
			master: true,
			updateFields: {
				region: 'eu'
			}
		};

		callSetRegion(msg, 'eu')
			.then(result => st.deepEqual(result, expected, 'sets the region "eu"'), error => st.fail(error))
			.then(() => st.end());
	});

	t.test('set "e"', st => {
		var msg = mocks.createMessage(null, 'steve');
		var expected = {
			sentMsg: '@steve, Region set to "eu".',
			master: true,
			updateFields: {
				region: 'eu'
			}
		};

		callSetRegion(msg, 'e')
			.then(result => st.deepEqual(result, expected, 'sets the region "eu"'), error => st.fail(error))
			.then(() => st.end());
	});

	t.test('set "ru"', st => {
		var msg = mocks.createMessage(null, 'garry');
		var expected = {
			sentMsg: '@garry, Region set to "ru".',
			master: true,
			updateFields: {
				region: 'ru'
			}
		};

		callSetRegion(msg, 'ru')
			.then(result => st.deepEqual(result, expected, 'sets the region "ru"'), error => st.fail(error))
			.then(() => st.end());
	});

	t.test('set "r"', st => {
		var msg = mocks.createMessage(null, 'terry');
		var expected = {
			sentMsg: '@terry, Region set to "ru".',
			master: true,
			updateFields: {
				region: 'ru'
			}
		};

		callSetRegion(msg, 'r')
			.then(result => st.deepEqual(result, expected, 'sets the region "ru"'), error => st.fail(error))
			.then(() => st.end());
	});

	t.test('set "asia"', st => {
		var msg = mocks.createMessage(null, 'marge');
		var expected = {
			sentMsg: '@marge, Region set to "asia".',
			master: true,
			updateFields: {
				region: 'asia'
			}
		};

		callSetRegion(msg, 'asia')
			.then(result => st.deepEqual(result, expected, 'sets the region "asia"'), error => st.fail(error))
			.then(() => st.end());
	});

	t.test('set "a"', st => {
		var msg = mocks.createMessage(null, 'jill');
		var expected = {
			sentMsg: '@jill, Region set to "asia".',
			master: true,
			updateFields: {
				region: 'asia'
			}
		};

		callSetRegion(msg, 'a')
			.then(result => st.deepEqual(result, expected, 'sets the region "asia"'), error => st.fail(error))
			.then(() => st.end());
	});

	t.end();
});
