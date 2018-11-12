const test = require('tape');
const mockery = require('mockery');
const mocks = require('./mocks');

mockery.registerAllowable('./index.js');
mockery.registerAllowable('../lib/command/setRegion.js');
mockery.registerMock('../../blitzbot.json', {
	wotblitz: {
		default_region: 'na'
	}
});
mockery.enable();

const setRegion = require('../lib/command/setRegion.js');

mockery.disable();
mockery.deregisterAll();

const callSetRegion = (msg, region) => setRegion.fn.call(mocks.commands, msg, region);

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
		const msg = mocks.createMessage(null, 'mark');
		const expected = {
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
		const msg = mocks.createMessage(null, 'bill');
		const expected = {
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
		const msg = mocks.createMessage(null, 'greg');
		const expected = {
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
		const msg = mocks.createMessage(null, 'wendy');
		const expected = {
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
		const msg = mocks.createMessage(null, 'steve');
		const expected = {
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
		const msg = mocks.createMessage(null, 'garry');
		const expected = {
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
		const msg = mocks.createMessage(null, 'terry');
		const expected = {
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
		const msg = mocks.createMessage(null, 'marge');
		const expected = {
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
		const msg = mocks.createMessage(null, 'jill');
		const expected = {
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
