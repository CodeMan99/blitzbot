var test = require('tape');
var nock = require('nock');
var mocks = require('./mocks');
var whoami = require('../lib/command/whoami.js');
var callWhoami = (msg, record) => whoami.fn.call(mocks.commands, msg, record);

test('command.whoami', t => {
	t.deepEqual(whoami.fn.options, {
		argCount: 0,
		argSplit: ' ',
		description: 'Get the nickname of the blitz account. Use the `add` command to change accounts.',
		passRecord: true,
		signatures: ['@BOTNAME whoami']
	}, 'verify options');

	t.test('nickname has not changed', st => {
		var accountInfo = nock('https://api.wotblitz.com')
			.post('/wotb/account/info/', {
				account_id: '1008921043',
				fields: 'nickname',
				application_id: process.env.APPLICATION_ID,
				language: 'en'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 1
				},
				data: {
					'1008921043': {
						nickname: 'cooldude01'
					}
				}
			});

		callWhoami(mocks.createMessage(null, 'cooldude01'), {account_id: 1008921043, nickname: 'cooldude01'}).then(result => {
			st.deepEqual(result, {sentMsg: '@cooldude01, You are using `cooldude01` (account_id: 1008921043)'}, 'replies');
			st.ok(accountInfo.isDone(), 'made one wotblitz api call');
			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('nickname changed', st => {
		var accountInfo = nock('https://api.wotblitz.com')
			.post('/wotb/account/info/', {
				account_id: '1008921054',
				fields: 'nickname',
				application_id: process.env.APPLICATION_ID,
				language: 'en'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 1
				},
				data: {
					'1008921054': {
						nickname: 'lamedude04'
					}
				}
			});

		callWhoami(mocks.createMessage(null, 'SomeDude'), {account_id: 1008921054, nickname: 'bigdude08'}).then(result => {
			st.deepEqual(result, {
				sentMsg: '@SomeDude, You are using `lamedude04` (account_id: 1008921054)',
				updateFields: {
					nickname: 'lamedude04'
				}
			}, 'replies and indicates to update nickname');

			st.ok(accountInfo.isDone(), 'made one wotblitz api call');
			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.end();
});
