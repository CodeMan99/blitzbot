const test = require('tape');
const nock = require('nock');
const mocks = require('./mocks');
const topDmg = require('../lib/command/topDmg');
const callTopDmg = topDmg.fn.bind(mocks.commands);

test('command.topDmg', t => {
	t.equal(topDmg.name, 'top-dmg', 'verify Commands method name');
	t.deepEqual(topDmg.fn.options, {
		argCount: 0,
		argSplit: ' ',
		description: 'Get your top 10 tanks by average damage',
		passRecord: true,
		signatures: ['@BOTNAME top-dmg']
	}, 'verify options');

	t.test('call', st => {
		const stats = nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '1009634067',
				application_id: process.env.APPLICATION_ID,
				fields: 'tank_id,all.battles,all.damage_dealt',
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
						all: { // 394.44 -- Not included in top 10
							damage_dealt: 7100,
							battles: 18
						},
						tank_id: 769
					}, {
						all: { // 806.19
								damage_dealt: 54046,
								battles: 72
						},
						tank_id: 13329
					}, {
						all: { // 798.22
								damage_dealt: 14368,
								battles: 18
						},
						tank_id: 52065
					}, {
						all: { // 1311.75
								damage_dealt: 233492,
								battles: 178
						},
						tank_id: 2657
					}, {
						all: { // 758.62
								damage_dealt: 46276,
								battles: 61
						},
						tank_id: 14145
					}, {
						all: { // 954.79
								damage_dealt: 103117,
								battles: 108
						},
						tank_id: 6721
					}, {
						all: { // 1371.60
								damage_dealt: 145390,
								battles: 106
						},
						tank_id: 3921
					}, {
						all: { // 205.38 -- Not included in top 10
								damage_dealt: 1643,
								battles: 8
						},
						tank_id: 3329
					}, {
						all: { // 419.27
								damage_dealt: 13836,
								battles: 33
						},
						tank_id: 17169
					}, {
						all: { // 1182.76
								damage_dealt: 158490,
								battles: 134
						},
						tank_id: 2321
					}, {
						all: { // 738.69
								damage_dealt: 23638,
								battles: 32
						},
						tank_id: 6481
					}, {
						all: { // 1571.97
								damage_dealt: 297103,
								battles: 189
						},
						tank_id: 5377
					}]
				}
			});
		const vehicles = nock('https://api.wotblitz.com')
			.post('/wotb/encyclopedia/vehicles/', {
				application_id: process.env.APPLICATION_ID,
				fields: 'name,tier,nation',
				language: 'en',
				nation: '',
				tank_id: '5377,3921,2657,2321,6721,52065,14145,13329,6481,17169'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 10
				},
				data: {
					'2321': {
						tier: 6,
						name: 'VK 36.01 (H)',
						nation: 'germany'
					},
					'2657': {
						tier: 8,
						name: 'STA-1',
						nation: 'japan'
					},
					'3921': {
						tier: 8,
						name: 'Caernarvon',
						nation: 'uk'
					},
					'5377': {
						tier: 8,
						name: 'IS-3',
						nation: 'ussr'
					},
					'6481': {
						tier: 4,
						name: 'Covenanter',
						nation: 'uk'
					},
					'6721': {
						tier: 5,
						name: 'BDR G1 B',
						nation: 'france'
					},
					'13329': {
						tier: 4,
						name: 'Durchbruchswagen 2',
						nation: 'germany'
					},
					'14145': {
						tier: 5,
						name: 'AMX ELC bis',
						nation: 'france'
					},
					'17169': {
						tier: 3,
						name: 'Pz.Kpfw. IV Ausf. A',
						nation: 'germany'
					},
					'52065': {
						tier: 4,
						name: 'Hetzer Kame SP',
						nation: 'japan'
					}
				}
			});
		const expected = {
			sentMsg: [
				'@SillyGamer5, ',
				'1: 1571.97 dmg - IS-3 (ussr, 8)',
				'2: 1371.60 dmg - Caernarvon (uk, 8)',
				'3: 1311.75 dmg - STA-1 (japan, 8)',
				'4: 1182.76 dmg - VK 36.01 (H) (germany, 6)',
				'5: 954.79 dmg - BDR G1 B (france, 5)',
				'6: 798.22 dmg - Hetzer Kame SP (japan, 4)',
				'7: 758.62 dmg - AMX ELC bis (france, 5)',
				'8: 750.64 dmg - Durchbruchswagen 2 (germany, 4)',
				'9: 738.69 dmg - Covenanter (uk, 4)',
				'10: 419.27 dmg - Pz.Kpfw. IV Ausf. A (germany, 3)'
			].join('\n')
		};

		callTopDmg(mocks.createMessage(null, 'SillyGamer5'), {account_id: 1009634067}).then(result => {
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
				application_id: process.env.APPLICATION_ID,
				fields: 'tank_id,all.battles,all.damage_dealt',
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
							battles: 1,
							damage_dealt: 892
						}
					}, {
						tank_id: 202,
						all: {
							battles: 2,
							damage_dealt: 884
						}
					}, {
						tank_id: 203,
						all: {
							battles: 3,
							damage_dealt: 901
						}
					}]
				}
			});
		const vehicles = nock('https://api.wotblitz.com')
			.post('/wotb/encyclopedia/vehicles/', {
				application_id: process.env.APPLICATION_ID,
				fields: 'name,tier,nation',
				language: 'en',
				nation: '',
				tank_id: '200,202,203'
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
				'@BigTanks, ',
				'1: 892.00 dmg - Unknown vehicle (-, -)',
				'2: 442.00 dmg - T2 Medium (us, 2)',
				'3: 300.33 dmg - M2 Medium (us, 3)'
			].join('\n')
		};

		callTopDmg(mocks.createMessage(null, 'BigTanks'), {account_id: 1009823019}).then(result => {
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
