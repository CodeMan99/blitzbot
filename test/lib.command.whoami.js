const test = require('tape');
const nock = require('nock');
const {autoEndTest} = require('./.utility.js');
const mocks = require('./mocks');
const whoami = require('../lib/command/whoami.js');
const callWhoami = (msg, record) => whoami.fn.call(mocks.commands, msg, record);
const application_id = process.env.APPLICATION_ID;

test('command.whoami', t => {
	t.deepEqual(whoami.fn.options, {
		argCount: 0,
		argSplit: ' ',
		description: 'Get the nickname of the blitz account. Use the `add` command to change accounts.',
		passRecord: true,
		signatures: ['@BOTNAME whoami']
	}, 'verify options');

	t.test('nickname has not changed', autoEndTest(async st => {
		const accountInfo = nock('https://api.wotblitz.com')
			.post('/wotb/account/info/', {
				access_token: '',
				account_id: '1008921043',
				extra: '',
				fields: 'nickname',
				application_id,
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
		const result = await callWhoami(mocks.createMessage(null, 'cooldude01'), {account_id: 1008921043, nickname: 'cooldude01'});

		st.deepEqual(result, {sentMsg: '@cooldude01, You are using `cooldude01` (account_id: 1008921043)'}, 'replies');
		st.ok(accountInfo.isDone(), 'made one wotblitz api call');
	}));

	t.test('nickname changed', autoEndTest(async st => {
		const accountInfo = nock('https://api.wotblitz.com')
			.post('/wotb/account/info/', {
				access_token: '',
				account_id: '1008921054',
				extra: '',
				fields: 'nickname',
				application_id,
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
		const result = await callWhoami(mocks.createMessage(null, 'SomeDude'), {account_id: 1008921054, nickname: 'bigdude08'});

		st.deepEqual(result, {
			sentMsg: '@SomeDude, You are using `lamedude04` (account_id: 1008921054)',
			updateFields: {
				nickname: 'lamedude04'
			}
		}, 'replies and indicates to update nickname');

		st.ok(accountInfo.isDone(), 'made one wotblitz api call');
	}));

	t.end();
});
