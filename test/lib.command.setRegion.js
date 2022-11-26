const test = require('tape');
const mockery = require('mockery');
const {autoEndTest} = require('./.utility.js');
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

	t.test('no argument', autoEndTest(async st => {
		const msg = mocks.createMessage(null, 'mark');
		const expected = {
			sentMsg: '@mark, Region set to "na".',
			master: true,
			updateFields: {
				region: 'na'
			}
		};
		const result = await callSetRegion(msg);

		st.deepEqual(result, expected, 'sets the region "na"');
	}));

	t.test('set "na"', autoEndTest(async st => {
		const msg = mocks.createMessage(null, 'bill');
		const expected = {
			sentMsg: '@bill, Region set to "na".',
			master: true,
			updateFields: {
				region: 'na'
			}
		};
		const result = await callSetRegion(msg, 'na');

		st.deepEqual(result, expected, 'sets the region "na"');
	}));

	t.test('set "n"', autoEndTest(async st => {
		const msg = mocks.createMessage(null, 'greg');
		const expected = {
			sentMsg: '@greg, Region set to "na".',
			master: true,
			updateFields: {
				region: 'na'
			}
		};
		const result = await callSetRegion(msg, 'n');

		st.deepEqual(result, expected, 'sets the region "na"');
	}));

	t.test('set "eu"', autoEndTest(async st => {
		const msg = mocks.createMessage(null, 'wendy');
		const expected = {
			sentMsg: '@wendy, Region set to "eu".',
			master: true,
			updateFields: {
				region: 'eu'
			}
		};
		const result = await callSetRegion(msg, 'eu');

		st.deepEqual(result, expected, 'sets the region "eu"');
	}));

	t.test('set "e"', autoEndTest(async st => {
		const msg = mocks.createMessage(null, 'steve');
		const expected = {
			sentMsg: '@steve, Region set to "eu".',
			master: true,
			updateFields: {
				region: 'eu'
			}
		};
		const result = await callSetRegion(msg, 'e');

		st.deepEqual(result, expected, 'sets the region "eu"');
	}));

	t.test('set "ru"', autoEndTest(async st => {
		const msg = mocks.createMessage(null, 'garry');
		const expected = {
			sentMsg: '@garry, Region set to "ru".',
			master: true,
			updateFields: {
				region: 'ru'
			}
		};
		const result = await callSetRegion(msg, 'ru');

		st.deepEqual(result, expected, 'sets the region "ru"');
	}));

	t.test('set "r"', autoEndTest(async st => {
		const msg = mocks.createMessage(null, 'terry');
		const expected = {
			sentMsg: '@terry, Region set to "ru".',
			master: true,
			updateFields: {
				region: 'ru'
			}
		};
		const result = await callSetRegion(msg, 'r');

		st.deepEqual(result, expected, 'sets the region "ru"');
	}));

	t.test('set "asia"', autoEndTest(async st => {
		const msg = mocks.createMessage(null, 'marge');
		const expected = {
			sentMsg: '@marge, Region set to "asia".',
			master: true,
			updateFields: {
				region: 'asia'
			}
		};
		const result = await callSetRegion(msg, 'asia');

		st.deepEqual(result, expected, 'sets the region "asia"');
	}));

	t.test('set "a"', autoEndTest(async st => {
		const msg = mocks.createMessage(null, 'jill');
		const expected = {
			sentMsg: '@jill, Region set to "asia".',
			master: true,
			updateFields: {
				region: 'asia'
			}
		};
		const result = await callSetRegion(msg, 'a');

		st.deepEqual(result, expected, 'sets the region "asia"');
	}));

	t.end();
});
