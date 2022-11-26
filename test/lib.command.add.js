const test = require('tape');
const nock = require('nock');
const {autoEndTest} = require('./.utility.js');
const mocks = require('./mocks');
const add = require('../lib/command/add.js');
const callAdd = add.fn.bind(mocks.commands);
const application_id = process.env.APPLICATION_ID;

test('command.add', t => {
	t.deepEqual(add.fn.options, {
		argCount: 1,
		argSplit: ' ',
		description: 'Associate your blitz username with discord.',
		passRecord: false,
		signatures: ['@BOTNAME add <blitz-username>']
	}, 'verify options');

	t.equal(add.name, 'add', 'verify Commands method name');

	t.test('no arguments response', autoEndTest(async st => {
		const result = await callAdd(mocks.createMessage(null, 'Jim [CLN12]'));

		st.deepEqual(result, {
			sentMsg: '@Jim [CLN12], You must specify your Blitz username. Do *not* include the clan tag.'
		}, 'correct validation response');
	}));

	t.test('valid username argument', autoEndTest(async st => {
		nock('https://api.wotblitz.com')
			.post('/wotb/account/list/', {
				application_id,
				fields: '',
				language: 'en',
				limit: '',
				search: 'joe234',
				type: ''
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 3
				},
				data: [{
					nickname: 'joe2340',
					account_id: 1009218105
				}, {
					nickname: 'joe2345',
					account_id: 1009218115
				}, {
					nickname: 'Joe234',
					account_id: 1009218110
				}]
			});

		const result = await callAdd(mocks.createMessage(null, 'joe234 [CLAN1]'), 'joe234');

		st.deepEqual(result, {
			sentMsg: '@joe234 [CLAN1], Welcome! You now have access to all commands. :)',
			updateFields: {
				nickname: 'Joe234',
				account_id: 1009218110,
				wins: 0,
				battles: 0
			}
		}, 'found correct document in response');
	}));

	t.test('invalid username argument', autoEndTest(async st => {
		nock('https://api.wotblitz.com')
			.post('/wotb/account/list/', {
				application_id,
				fields: '',
				language: 'en',
				limit: '',
				search: 'tankkiller',
				type: ''
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 3
				},
				data: [{
					nickname: 'TankKiller01',
					account_id: 1009218205
				}, {
					nickname: 'tankkiller02',
					account_id: 1009218215
				}, {
					nickname: 'tankkiller03',
					account_id: 1009218210
				}]
			});

		const result = await callAdd(mocks.createMessage(null, 'TankKiller [CLAN2]'), 'TANKKILLER');

		st.deepEqual(result, {
			sentMsg: '@TankKiller [CLAN2], No Blitz account found for `tankkiller`...'
		}, 'found no document in the response');
	}));

	t.end();
});
