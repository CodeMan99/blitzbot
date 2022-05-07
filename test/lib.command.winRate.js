const test = require('tape');
const Datastore = require('../lib/datastore.js');
const nock = require('nock');
const mocks = require('./mocks');
const vehicleList = require('./mocks/vehicles.json');
const wr = require('../lib/command/winRate.js');
const dbInstance = new Datastore({
	inMemoryOnly: true,
	timestampData: true,
	autoload: true
});
const callTankWinRate = wr.tankWinRate.fn.bind(Object.assign(mocks.commands, {db: dbInstance}));
const callWinRate = wr.winRate.fn.bind(mocks.commands);
const application_id = process.env.APPLICATION_ID;

test('command.winRate.tankWinRate', t => {
	t.deepEqual(wr.tankWinRate.fn.options, {
		alias: 'twr',
		argCount: 1,
		argSplit: null,
		description: 'Get your win rate for the given tank.',
		passRecord: true,
		signatures: [
			'@BOTNAME tank-win-rate <tank-name>',
			'@BOTNAME twr <tank-name>'
		]
	}, 'verify options');

	t.equal(wr.tankWinRate.name, 'tank-win-rate', 'verify Commands method name');

	t.test('provided no argument', st => {
		callTankWinRate(mocks.createMessage(null, 'dumb43 [CL]'), { /* record */ }).then(result => {
			st.deepEqual(result, {
				sentMsg: '@dumb43 [CL], Must specify a vehicle for "tank-win-rate".'
			}, 'tells the user to provide an argument');

			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	const encyclopediaVehiclesMock = () => {
		return nock('https://api.wotblitz.com')
			.post('/wotb/encyclopedia/vehicles/', {
				application_id,
				fields: 'name,nation,tier',
				language: 'en',
				nation: '',
				tank_id: ''
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 236
				},
				data: vehicleList
			});
	};

	t.test('no tank name matches argument', st => {
		const tankopediaVehicles = encyclopediaVehiclesMock();

		callTankWinRate(mocks.createMessage(null, 'jake81 [CL]'), {
			account_id: 100996734
		}, 'no tank matches').then(result => {
			st.notOk(result, 'resolves without a response');
			st.ok(tankopediaVehicles.isDone(), 'make one api call');
			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('argument is a valid tank, but has no record', st => {
		const tankopediaVehicles = encyclopediaVehiclesMock();
		const tankStats = nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '100998143',
				application_id,
				fields: 'tank_id,all.battles,all.wins',
				in_garage: '',
				language: 'en',
				tank_id: '55073'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 1
				},
				data: {
					'100998143': null
				}
			});

		callTankWinRate(mocks.createMessage(null, 'meganthetanker [CL]', []), {account_id: 100998143}, 'T7 Combat Car')
			.then(result => {
				st.deepEqual(result, {
					sentMsg: '@meganthetanker [CL], I found no stats related to your search.'
				}, 'verify response explains that the tank has yet to be played');

				st.ok(tankopediaVehicles.isDone() && tankStats.isDone(), 'make two api calls');
				st.end();
			}, error => {
				st.fail(error);
				st.end();
			});
	});

	t.test('argument returns one tank', st => {
		const tankopediaVehicles = encyclopediaVehiclesMock();
		const tankStats = nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '100998144',
				application_id,
				in_garage: '',
				fields: 'tank_id,all.battles,all.wins',
				language: 'en',
				tank_id: '54289'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 1
				},
				data: {
					'100998144': [{
						all: {
							battles: 283,
							wins: 159
						},
						tank_id: 54289
					}]
				}
			});

		callTankWinRate(mocks.createMessage(null, 'hulkhogan [CL]', []), {account_id: 100998144}, 'Löwe').then(result => {
			st.deepEqual(result, {
				sentMsg: '@hulkhogan [CL], Löwe (germany, 8): 56.18% after 283 battles.'
			}, 'verify response');

			st.ok(tankopediaVehicles.isDone() && tankStats.isDone(), 'make two api calls');
			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('argument returns two tanks', st => {
		const tankopediaVehicles = encyclopediaVehiclesMock();
		const tankStats = nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '100998145',
				application_id,
				fields: 'tank_id,all.battles,all.wins',
				language: 'en',
				in_garage: '',
				tank_id: '5921,13345'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 1
				},
				data: {
					'100998145': [{
						all: {
							battles: 534,
							wins: 383
						},
						tank_id: 5921
					}, {
						all: {
							battles: 74,
							wins: 39
						},
						tank_id: 13345
					}]
				}
			});

		callTankWinRate(mocks.createMessage(null, 'jessie5 [CL]', []), {account_id: 100998145}, 'Pershing').then(result => {
			st.deepEqual(result, {
				sentMsg: [
					'@jessie5 [CL], M26 Pershing (usa, 8): 71.72% after 534 battles.',
					'T26E4 SuperPershing (usa, 8): 52.70% after 74 battles.'
				].join('\n')
			}, 'verify response');

			st.ok(tankopediaVehicles.isDone() && tankStats.isDone(), 'make two api calls');
			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('matches tank names with accents', st => {
		const tankopediaVehicles = encyclopediaVehiclesMock();
		const tankStats = nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '100996799',
				application_id,
				fields: 'tank_id,all.battles,all.wins',
				in_garage: '',
				language: 'en',
				tank_id: '54289'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 1
				},
				data: {
					'100996799': [{
						all: {
							battles: 112,
							wins: 64
						},
						tank_id: 54289
					}]
				}
			});

		callTankWinRate(mocks.createMessage(null, 'statdude [STAT]', []), {account_id: 100996799}, 'Lowe').then(result => {
			st.deepEqual(result, {sentMsg: '@statdude [STAT], Löwe (germany, 8): 57.14% after 112 battles.'}, 'verify response');
			st.ok(tankopediaVehicles.isDone() && tankStats.isDone(), 'made two api calls');
			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('argument matches more than 100 limit of tankopedia endpoint', st => {
		const tankopediaVehicles = encyclopediaVehiclesMock();

		callTankWinRate(mocks.createMessage(null, 'noshootingheretonight'), {account_id: 100998146}, 't').then(result => {
			st.deepEqual(result, {
				sentMsg: '@noshootingheretonight, Found too many vehicles with `t`.'
			}, 'verify response');
			st.ok(tankopediaVehicles.isDone(), 'make one api call');
			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('mention another user that does not exist in the database', st => {
		// TODO: This request should be done in parallel with the database query
		const tankopediaVehicles = encyclopediaVehiclesMock();
		const mentions = [{
			id: 'fakediscordid0',
			username: 'buddy5 [CL]',
			toString: function() {
				return `<@${this.id}>`;
			},
			bot: false
		}, {
			id: '0101',
			username: 'testbot',
			toString: function() {
				return `<@${this.id}>`;
			},
			bot: true
		}];

		callTankWinRate(mocks.createMessage(null, 'bigtanker5 [CL]', mentions), {account_id: 100998147}, 'Pershing').then(result => {
			st.deepEqual(result, {
				sentMsg: '@bigtanker5 [CL], I do not know who <@fakediscordid0> is. Sorry about that.'
			}, 'verify response');
			st.ok(tankopediaVehicles.isDone(), 'make one api call'); // technically wrong (see TODO above)
			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('mention another user to get their stats', st => {
		// TODO: This request should be done in parallel with the database query
		const tankopediaVehicles = encyclopediaVehiclesMock();
		const tankStats = nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '100998149',
				application_id,
				fields: 'tank_id,all.battles,all.wins',
				in_garage: '',
				language: 'en',
				tank_id: '529,5137'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 1
				},
				data: {
					'100998149': [{
						all: {
							battles: 227,
							wins: 121
						},
						tank_id: 529
					}]
				}
			});
		const mentions = [{
			id: 'fakediscordid1',
			username: 'girly7 [CL]',
			mention: function() {
				return `<@${this.id}>`;
			},
			bot: false
		}, {
			id: '0101',
			username: 'testbot',
			mention: function() {
				return `<@${this.id}>`;
			},
			bot: true
		}];

		dbInstance.insert({
			_id: 'fakediscordid1',
			account_id: 100998149
		}, insertErr => {
			if (insertErr) {
				st.fail(insertErr);
				st.end();
			}

			callTankWinRate(mocks.createMessage(null, 'iambesttanker [CL]', mentions), {account_id: 100998148}, 'Tiger I')
				.then(result => {
					st.deepEqual(result, {
						sentMsg: '@iambesttanker [CL], Tiger I (germany, 7): 53.30% after 227 battles.'
					}, 'verify response');
					st.ok(tankopediaVehicles.isDone() && tankStats.isDone(), 'make two api calls');
					st.end();
				}, error => {
					st.fail(error);
					st.end();
				});
		});
	});

	t.end();
});

test('command.winRate.winRate', t => {
	t.deepEqual(wr.winRate.fn.options, {
		alias: 'wr',
		argCount: 0,
		argSplit: ' ',
		description: 'Get the win rate of your account.',
		passRecord: true,
		signatures: [
			'@BOTNAME win-rate',
			'@BOTNAME wr'
		]
	}, 'verify options');

	t.equal(wr.winRate.name, 'win-rate', 'verify Commands method name');

	const accountInfoMock = (accountId, wins, battles) => {
		return nock('https://api.wotblitz.com')
			.post('/wotb/account/info/', {
				access_token: '',
				account_id: accountId.toString(),
				application_id,
				extra: '',
				fields: 'statistics.all.battles,statistics.all.wins',
				language: 'en'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 1
				},
				data: {
					[accountId]: {
						statistics: {
							all: {
								battles: battles,
								wins: wins
							}
						}
					}
				}
			});
	};

	t.test('initial call', st => {
		const accountInfo = accountInfoMock(100994563, 8691, 14280);

		callWinRate(mocks.createMessage(null, 'bigguy20 [CL]'), {
			account_id: 100994563,
			wins: 0,
			battles: 0
		}).then(result => {
			st.deepEqual(result, {
				sentMsg: '@bigguy20 [CL], You have won 8691 of 14280 battles. That is 60.86% victory!',
				updateFields: {
					wins: 8691,
					battles: 14280
				}
			}, 'verify response and record update');

			st.ok(accountInfo.isDone(), 'made one API call');
			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('follow up call, no additional battles', st => {
		const accountInfo = accountInfoMock(100994564, 7682, 18290);

		callWinRate(mocks.createMessage(null, 'littleguy21 [CL]'), {
			account_id: 100994564,
			wins: 7682,
			battles: 18290
		}).then(result => {
			st.deepEqual(result, {
				sentMsg: '@littleguy21 [CL], You have won 7682 of 18290 battles. That is 42.00% victory!'
			}, 'verify response');

			st.ok(accountInfo.isDone(), 'made one API call');
			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('follow up call, one additional battle', st => {
		const accountInfo = accountInfoMock(100994565, 9260, 13933);

		callWinRate(mocks.createMessage(null, 'biggirl22 [CL]'), {
			account_id: 100994565,
			wins: 9259,
			battles: 13932
		}).then(result => {
			st.deepEqual(result, {
				sentMsg: [
					'@biggirl22 [CL], You have won 9260 of 13933 battles. That is 66.46% victory!',
					'Last time you asked was 1 battles ago, at 66.46% victory.',
					'Over those 1 battles, you won 100.00%!'
				].join('\n'),
				updateFields: {
					wins: 9260,
					battles: 13933
				}
			}, 'verify response and record update');

			st.ok(accountInfo.isDone(), 'made one API call');
			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('follow up call, several additional battles', st => {
		const accountInfo = accountInfoMock(100994566, 5003, 11502);

		callWinRate(mocks.createMessage(null, 'littlegirl23 [CL]'), {
			account_id: 100994566,
			wins: 4992,
			battles: 11483
		}).then(result => {
			st.deepEqual(result, {
				sentMsg: [
					'@littlegirl23 [CL], You have won 5003 of 11502 battles. That is 43.50% victory!',
					'Last time you asked was 19 battles ago, at 43.47% victory.',
					'Over those 19 battles, you won 57.89%!'
				].join('\n'),
				updateFields: {
					wins: 5003,
					battles: 11502
				}
			}, 'verify response and record update');

			st.ok(accountInfo.isDone(), 'made one API call');
			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.end();
});
