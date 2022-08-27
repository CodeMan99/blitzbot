const test = require('tape');
const nock = require('nock');
const mocks = require('./mocks');
const maxXp = require('../lib/command/maxXp');
const callMaxXp = maxXp.fn.bind(mocks.commands);
const application_id = process.env.APPLICATION_ID;

test('command.maxXp', t => {
	t.equal(maxXp.name, 'max-xp', 'verify Commands method name');
	t.deepEqual(maxXp.fn.options, {
		argCount: 0,
		argSplit: ' ',
		description: 'Get your top 10 *max-xp* values.',
		passRecord: true,
		signatures: ['@BOTNAME max-xp']
	}, 'verify options');

	t.test('call', st => {
		const stats = nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '1009634067',
				application_id,
				fields: 'tank_id,all.max_xp',
				in_garage: '',
				language: 'en',
				tank_id: ''
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 1
				},
				data: {
					'1009634067': [{
						tank_id: 109,
						all: {
							max_xp: 1844
						}
					}, {
						tank_id: 43,
						all: {
							max_xp: 1794
						}
					}, {
						tank_id: 21,
						all: {
							max_xp: 1551
						}
					}, {
						tank_id: 98,
						all: {
							max_xp: 1518
						}
					}, {
						tank_id: 10,
						all: {
							max_xp: 900
						}
					}, {
						tank_id: 32,
						all: {
							max_xp: 1335
						}
					}, {
						tank_id: 87,
						all: {
							max_xp: 1486
						}
					}, {
						tank_id: 76,
						all: {
							max_xp: 1457
						}
					}, {
						// this tank is not top 10
						tank_id: 79,
						all: {
							max_xp: 899
						}
					}, {
						tank_id: 54,
						all: {
							max_xp: 1422
						}
					}, {
						tank_id: 65,
						all: {
							max_xp: 1549
						}
					}]
				}
			});
		const vehicles = nock('https://api.wotblitz.com')
			.post('/wotb/encyclopedia/vehicles/', {
				application_id,
				fields: 'name,tier,nation',
				language: 'en',
				nation: '',
				tank_id: '109,43,21,65,98,87,76,54,32,10'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 10
				},
				data: {
					'10': {
						name: 'Cruiser Mk. III',
						tier: 2,
						nation: 'uk'
					},
					'109': {
						name: 'Cromwell',
						tier: 6,
						nation: 'uk'
					},
					'21': {
						name: 'T1 Heavy',
						tier: 5,
						nation: 'usa'
					},
					'32': {
						name: 'M3 Lee',
						tier: 4,
						nation: 'usa'
					},
					'43': {
						name: 'T-44',
						tier: 8,
						nation: 'ussr'
					},
					'54': {
						name: 'KV-13',
						tier: 7,
						nation: 'ussr'
					},
					'65': {
						name: 'Jagdpanther',
						tier: 7,
						nation: 'germany'
					},
					'76': {
						name: 'Leopard',
						tier: 5,
						nation: 'germany'
					},
					'87': {
						name: 'Type 5 Ke-Ho',
						tier: 4,
						nation: 'japan'
					},
					'98': {
						name: 'Type 62',
						tier: 7,
						nation: 'china'
					}
				}
			});
		const expected = {
			sentMsg: [
				'@SillyGamer5, 1, 1844 xp: Cromwell (uk, 6)',
				'2, 1794 xp: T-44 (ussr, 8)',
				'3, 1551 xp: T1 Heavy (usa, 5)',
				'4, 1549 xp: Jagdpanther (germany, 7)',
				'5, 1518 xp: Type 62 (china, 7)',
				'6, 1486 xp: Type 5 Ke-Ho (japan, 4)',
				'7, 1457 xp: Leopard (germany, 5)',
				'8, 1422 xp: KV-13 (ussr, 7)',
				'9, 1335 xp: M3 Lee (usa, 4)',
				'10, 900 xp: Cruiser Mk. III (uk, 2)'
			].join('\n')
		};

		callMaxXp(mocks.createMessage(null, 'SillyGamer5'), {account_id: 1009634067}).then(result => {
			st.deepEqual(result, expected, 'verify response');
			st.ok(stats.isDone() && vehicles.isDone(), 'made two api calls');
			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('vehicle not in tankopedia, only 3 vehicles', st => {
		const stats = nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '1009823019',
				application_id,
				fields: 'tank_id,all.max_xp',
				in_garage: '',
				language: 'en',
				tank_id: ''
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 1
				},
				data: {
					'1009823019': [{
						tank_id: 200,
						all: {
							max_xp: 892
						}
					}, {
						tank_id: 202,
						all: {
							max_xp: 884
						}
					}, {
						tank_id: 203,
						all: {
							max_xp: 901
						}
					}]
				}
			});
		const vehicles = nock('https://api.wotblitz.com')
			.post('/wotb/encyclopedia/vehicles/', {
				application_id,
				fields: 'name,tier,nation',
				language: 'en',
				nation: '',
				tank_id: '203,200,202'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 3
				},
				data: {
					'200': null,
					'202': {
						name: 'T2 Medium',
						tier: 2,
						nation: 'us'
					},
					'203': {
						name: 'M2 Medium',
						tier: 3,
						nation: 'us'
					}
				}
			});
		const expected = {
			sentMsg: [
				'@BigTanks, 1, 901 xp: M2 Medium (us, 3)',
				'2, 892 xp: Unknown vehicle (-, -)',
				'3, 884 xp: T2 Medium (us, 2)'
			].join('\n')
		};

		callMaxXp(mocks.createMessage(null, 'BigTanks'), {account_id: 1009823019}).then(result => {
			st.deepEqual(result, expected, 'verify response');
			st.ok(stats.isDone() && vehicles.isDone(), 'made two api calls');
			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.end();
});
