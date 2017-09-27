var test = require('tape');
var nock = require('nock');
var mocks = require('./mocks');
var add = require('../lib/command/add.js');
var callAdd = add.fn.bind(mocks.commands);

test('command.add', t => {
	t.deepEqual(add.fn.options, {
		argCount: 1,
		argSplit: ' ',
		description: 'Associate your blitz username with discord.',
		passRecord: false,
		signatures: ['@BOTNAME add <blitz-username>']
	}, 'verify options');

	t.equal(add.name, 'add', 'verify Commands method name');

	t.test('no arguments response', st => {
		callAdd(mocks.createMessage(null, 'Jim [CLN12]')).then(result => {
			st.deepEqual(result, {
				sentMsg: '@Jim [CLN12], You must specify your Blitz username. Do *not* include the clan tag.'
			}, 'correct validation response');

			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('valid username argument', st => {
		nock('https://api.wotblitz.com')
			.post('/wotb/account/list/', {
				application_id: process.env.APPLICATION_ID,
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

		callAdd(mocks.createMessage(null, 'joe234 [CLAN1]'), 'joe234').then(result => {
			st.deepEqual(result, {
				sentMsg: '@joe234 [CLAN1], Welcome! You now have access to all commands. :)',
				updateFields: {
					nickname: 'Joe234',
					account_id: 1009218110
				}
			}, 'found correct document in response');

			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('invalid username argument', st => {
		nock('https://api.wotblitz.com')
			.post('/wotb/account/list/', {
				application_id: process.env.APPLICATION_ID,
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

		callAdd(mocks.createMessage(null, 'TankKiller [CLAN2]'), 'TANKKILLER').then(result => {
			st.deepEqual(result, {
				sentMsg: '@TankKiller [CLAN2], No Blitz account found for `tankkiller`...'
			}, 'found no document in the response');

			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.end();
});
