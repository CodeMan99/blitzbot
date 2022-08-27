const test = require('tape');
const nock = require('nock');
const mocks = require('./mocks');
const masteryList = require('../lib/command/masteryList.js');
const callMasteryList = masteryList.fn.bind(mocks.commands);
const application_id = process.env.APPLICATION_ID;

test('command.masteryList', t => {
	t.deepEqual(masteryList.fn.options, {
		alias: 'ml',
		argCount: 1,
		argSplit: null,
		description: 'List tanks at the given mastery level (defaults to "Mastery").',
		passRecord: true,
		signatures: [
			'@BOTNAME mastery-list [level]',
			'@BOTNAME ml [level]'
		]
	}, 'verify options');

	t.equal(masteryList.name, 'mastery-list', 'verify Commands method name');

	t.test('no argument default', st => {
		nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '100991240',
				application_id,
				fields: 'mark_of_mastery,tank_id',
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
					'100991240': [{
						mark_of_mastery: 0,
						tank_id: 1
					}, {
						mark_of_mastery: 1,
						tank_id: 2
					}, {
						mark_of_mastery: 2,
						tank_id: 3
					}, {
						mark_of_mastery: 3,
						tank_id: 4
					}, {
						mark_of_mastery: 4,
						tank_id: 5
					}, {
						mark_of_mastery: 0,
						tank_id: 6
					}, {
						mark_of_mastery: 1,
						tank_id: 7
					}, {
						mark_of_mastery: 2,
						tank_id: 8
					}, {
						mark_of_mastery: 3,
						tank_id: 9
					}, {
						mark_of_mastery: 4,
						tank_id: 10
					}]
				}
			});

		nock('https://api.wotblitz.com')
			.post('/wotb/encyclopedia/vehicles/', {
				application_id,
				fields: 'name,tier,nation',
				language: 'en',
				nation: '',
				tank_id: '5,10'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 2
				},
				data: {
					'5': {
						name: 'T-34',
						tier: 5,
						nation: 'ussr'
					},
					'10': {
						name: 'T1 Heavy',
						tier: 5,
						nation: 'usa'
					}
				}
			});

		callMasteryList(mocks.createMessage(null, 'john2 [TC]'), {
			nickname: 'john2',
			account_id: 100991240
		}).then(result => {
			st.deepEqual(result, {
				sentMsg: [
					'@john2 [TC], T-34 (ussr, 5)',
					'T1 Heavy (usa, 5)',
					'You have 2 tanks at Mastery, 20.00% of your 10 total tanks.'
				].join('\n')
			}, 'responds with the "Mastery" list');

			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('list "none"', st => {
		nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '100991241',
				application_id,
				in_garage: '',
				fields: 'mark_of_mastery,tank_id',
				language: 'en',
				tank_id: ''
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 1
				},
				data: {
					'100991241': [{
						mark_of_mastery: 0,
						tank_id: 1
					}, {
						mark_of_mastery: 1,
						tank_id: 2
					}, {
						mark_of_mastery: 2,
						tank_id: 3
					}, {
						mark_of_mastery: 3,
						tank_id: 4
					}, {
						mark_of_mastery: 4,
						tank_id: 5
					}, {
						mark_of_mastery: 0,
						tank_id: 6
					}, {
						mark_of_mastery: 1,
						tank_id: 7
					}, {
						mark_of_mastery: 2,
						tank_id: 8
					}, {
						mark_of_mastery: 3,
						tank_id: 9
					}, {
						mark_of_mastery: 4,
						tank_id: 10
					}, {
						mark_of_mastery: 0,
						tank_id: 11
					}]
				}
			});

		nock('https://api.wotblitz.com')
			.post('/wotb/encyclopedia/vehicles/', {
				application_id,
				fields: 'name,tier,nation',
				language: 'en',
				nation: '',
				tank_id: '1,6,11'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 3
				},
				data: {
					'1': {
						name: 'Löwe',
						tier: 8,
						nation: 'germany'
					},
					'6': {
						name: 'Centurion Mk. I',
						tier: 8,
						nation: 'uk'
					},
					'11': {
						name: 'STA-1',
						tier: 8,
						nation: 'japan'
					}
				}
			});

		callMasteryList(mocks.createMessage(null, 'bill4 [TC]'), {
			nickname: 'bill4',
			account_id: 100991241
		}, 'none').then(result => {
			st.deepEqual(result, {
				sentMsg: [
					'@bill4 [TC], Löwe (germany, 8)',
					'Centurion Mk. I (uk, 8)',
					'STA-1 (japan, 8)',
					'You have 3 tanks at None, 27.27% of your 11 total tanks.'
				].join('\n')
			}, 'responds with the "None" list');

			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('list "3rd class"', st => {
		nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '100991242',
				application_id,
				fields: 'mark_of_mastery,tank_id',
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
					'100991242': [{
						mark_of_mastery: 0,
						tank_id: 1
					}, {
						mark_of_mastery: 1,
						tank_id: 2
					}, {
						mark_of_mastery: 2,
						tank_id: 3
					}, {
						mark_of_mastery: 3,
						tank_id: 4
					}, {
						mark_of_mastery: 4,
						tank_id: 5
					}, {
						mark_of_mastery: 0,
						tank_id: 6
					}, {
						mark_of_mastery: 1,
						tank_id: 7
					}, {
						mark_of_mastery: 2,
						tank_id: 8
					}, {
						mark_of_mastery: 3,
						tank_id: 9
					}, {
						mark_of_mastery: 4,
						tank_id: 10
					}, {
						mark_of_mastery: 0,
						tank_id: 11
					}, {
						mark_of_mastery: 1,
						tank_id: 12
					}, {
						mark_of_mastery: 2,
						tank_id: 13
					}, {
						mark_of_mastery: 3,
						tank_id: 14
					}]
				}
			});

		nock('https://api.wotblitz.com')
			.post('/wotb/encyclopedia/vehicles/', {
				application_id,
				fields: 'name,tier,nation',
				language: 'en',
				nation: '',
				tank_id: '2,7,12'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 3
				},
				data: {
					'2': {
						name: 'T-26',
						tier: 2,
						nation: 'ussr'
					},
					'7': {
						name: 'Pz.Kpfw. II',
						tier: 2,
						nation: 'germany'
					},
					'12': {
						name: 'T2 Medium Tank',
						tier: 2,
						nation: 'usa'
					}
				}
			});

		callMasteryList(mocks.createMessage(null, 'greg3 [TC]'), {
			nickname: 'greg3',
			account_id: 100991242
		}, '3rd class').then(result => {
			st.deepEqual(result, {
				sentMsg: [
					'@greg3 [TC], T-26 (ussr, 2)',
					'Pz.Kpfw. II (germany, 2)',
					'T2 Medium Tank (usa, 2)',
					'You have 3 tanks at 3rd class, 21.43% of your 14 total tanks.'
				].join('\n')
			}, 'responds with the "3rd class" list');

			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('list "2nd class"', st => {
		nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '100991243',
				application_id,
				fields: 'mark_of_mastery,tank_id',
				language: 'en',
				in_garage: '',
				tank_id: ''
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 1
				},
				data: {
					'100991243': [{
						mark_of_mastery: 0,
						tank_id: 1
					}, {
						mark_of_mastery: 1,
						tank_id: 2
					}, {
						mark_of_mastery: 2,
						tank_id: 3
					}, {
						mark_of_mastery: 3,
						tank_id: 4
					}, {
						mark_of_mastery: 4,
						tank_id: 5
					}, {
						mark_of_mastery: 0,
						tank_id: 6
					}, {
						mark_of_mastery: 1,
						tank_id: 7
					}, {
						mark_of_mastery: 2,
						tank_id: 8
					}, {
						mark_of_mastery: 3,
						tank_id: 9
					}, {
						mark_of_mastery: 4,
						tank_id: 10
					}, {
						mark_of_mastery: 2,
						tank_id: 11
					}, {
						mark_of_mastery: 2,
						tank_id: 12
					}, {
						mark_of_mastery: 2,
						tank_id: 13
					}]
				}
			});

		nock('https://api.wotblitz.com')
			.post('/wotb/encyclopedia/vehicles/', {
				application_id,
				fields: 'name,tier,nation',
				language: 'en',
				nation: '',
				tank_id: '3,8,11,12,13'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 5
				},
				data: {
					'3': {
						name: 'BT-2',
						tier: 2,
						nation: 'ussr'
					},
					'8': {
						name: 'Pz.Kpfw. II Ausf. G',
						tier: 3,
						nation: 'germany'
					},
					'11': {
						name: 'Vickers Medium Mk. II',
						tier: 2,
						nation: 'uk'
					},
					'12': {
						name: 'M2 Medium Tank',
						tier: 3,
						nation: 'usa'
					},
					'13': {
						name: 'Pz.Kpfw. 38 t',
						tier: 3,
						nation: 'germany'
					}
				}
			});

		callMasteryList(mocks.createMessage(null, 'dude9 [TC]'), {
			nickname: 'dude9',
			account_id: 100991243
		}, '2nd class').then(result => {
			st.deepEqual(result, {
				sentMsg: [
					'@dude9 [TC], BT-2 (ussr, 2)',
					'Pz.Kpfw. II Ausf. G (germany, 3)',
					'Vickers Medium Mk. II (uk, 2)',
					'M2 Medium Tank (usa, 3)',
					'Pz.Kpfw. 38 t (germany, 3)',
					'You have 5 tanks at 2nd class, 38.46% of your 13 total tanks.'
				].join('\n')
			}, 'responds with the "2nd class" list');

			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('list "1st class"', st => {
		nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '100991244',
				application_id,
				fields: 'mark_of_mastery,tank_id',
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
					'100991244': [{
						mark_of_mastery: 0,
						tank_id: 1
					}, {
						mark_of_mastery: 1,
						tank_id: 2
					}, {
						mark_of_mastery: 2,
						tank_id: 3
					}, {
						mark_of_mastery: 3,
						tank_id: 4
					}, {
						mark_of_mastery: 4,
						tank_id: 5
					}, {
						mark_of_mastery: 0,
						tank_id: 6
					}, {
						mark_of_mastery: 1,
						tank_id: 7
					}, {
						mark_of_mastery: 2,
						tank_id: 8
					}, {
						mark_of_mastery: 3,
						tank_id: 9
					}, {
						mark_of_mastery: 4,
						tank_id: 10
					}, {
						mark_of_mastery: 3,
						tank_id: 11
					}, {
						mark_of_mastery: 0,
						tank_id: 12
					}, {
						mark_of_mastery: 4,
						tank_id: 13
					}]
				}
			});

		nock('https://api.wotblitz.com')
			.post('/wotb/encyclopedia/vehicles/', {
				application_id,
				fields: 'name,tier,nation',
				language: 'en',
				nation: '',
				tank_id: '4,9,11'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 3
				},
				data: {
					'4': {
						name: 'M4 Sherman',
						tier: 5,
						nation: 'usa'
					},
					'9': {
						name: 'Covenanter',
						tier: 4,
						nation: 'uk'
					},
					'11': {
						name: 'Type 3 Chi-Nu Kai',
						tier: 5,
						nation: 'japan'
					}
				}
			});

		callMasteryList(mocks.createMessage(null, 'bigjoe [TC]'), {
			nickname: 'bigjoe',
			account_id: 100991244
		}, '1st class').then(result => {
			st.deepEqual(result, {
				sentMsg: [
					'@bigjoe [TC], M4 Sherman (usa, 5)',
					'Covenanter (uk, 4)',
					'Type 3 Chi-Nu Kai (japan, 5)',
					'You have 3 tanks at 1st class, 23.08% of your 13 total tanks.'
				].join('\n')
			}, 'responds with the "1st class" list');

			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('list "m"', st => {
		nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '100991245',
				application_id,
				fields: 'mark_of_mastery,tank_id',
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
					'100991245': [{
						mark_of_mastery: 0,
						tank_id: 1
					}, {
						mark_of_mastery: 1,
						tank_id: 2
					}, {
						mark_of_mastery: 2,
						tank_id: 3
					}, {
						mark_of_mastery: 3,
						tank_id: 4
					}, {
						mark_of_mastery: 4,
						tank_id: 5
					}, {
						mark_of_mastery: 0,
						tank_id: 6
					}, {
						mark_of_mastery: 1,
						tank_id: 7
					}, {
						mark_of_mastery: 2,
						tank_id: 8
					}, {
						mark_of_mastery: 3,
						tank_id: 9
					}, {
						mark_of_mastery: 4,
						tank_id: 10
					}, {
						mark_of_mastery: 0,
						tank_id: 11
					}, {
						mark_of_mastery: 0,
						tank_id: 12
					}, {
						mark_of_mastery: 0,
						tank_id: 13
					}, {
						mark_of_mastery: 0,
						tank_id: 14
					}, {
						mark_of_mastery: 0,
						tank_id: 15
					}, {
						mark_of_mastery: 0,
						tank_id: 16
					}, {
						mark_of_mastery: 0,
						tank_id: 17
					}]
				}
			});

		nock('https://api.wotblitz.com')
			.post('/wotb/encyclopedia/vehicles/', {
				application_id,
				fields: 'name,tier,nation',
				language: 'en',
				nation: '',
				tank_id: '5,10'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 2
				},
				data: {
					'5': {
						name: 'T-34',
						tier: 5,
						nation: 'ussr'
					},
					'10': {
						name: 'T1 Heavy',
						tier: 5,
						nation: 'usa'
					}
				}
			});

		callMasteryList(mocks.createMessage(null, 'lilgal [TC]'), {
			nickname: 'lilgal',
			account_id: 100991245
		}, 'm').then(result => {
			st.deepEqual(result, {
				sentMsg: [
					'@lilgal [TC], T-34 (ussr, 5)',
					'T1 Heavy (usa, 5)',
					'You have 2 tanks at Mastery, 11.76% of your 17 total tanks.'
				].join('\n')
			}, 'responds with the "Mastery" list');

			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('invalid level argument', st => {
		callMasteryList(mocks.createMessage(null, 'jake48 [TC]'), {
			nickname: 'jake48',
			account_id: 100991246
		}, 'third class').then(result => {
			st.notOk(result, 'resolved without a response');
			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('empty list', st => {
		nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '100991247',
				application_id,
				fields: 'mark_of_mastery,tank_id',
				language: 'en',
				in_garage: '',
				tank_id: ''
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 1
				},
				data: {
					'100991247': [{
						mark_of_mastery: 4,
						tank_id: 1
					}, {
						mark_of_mastery: 1,
						tank_id: 2
					}, {
						mark_of_mastery: 2,
						tank_id: 3
					}, {
						mark_of_mastery: 3,
						tank_id: 4
					}, {
						mark_of_mastery: 3,
						tank_id: 5
					}, {
						mark_of_mastery: 4,
						tank_id: 6
					}, {
						mark_of_mastery: 1,
						tank_id: 7
					}, {
						mark_of_mastery: 2,
						tank_id: 8
					}, {
						mark_of_mastery: 3,
						tank_id: 9
					}, {
						mark_of_mastery: 2,
						tank_id: 10
					}, {
						mark_of_mastery: 4,
						tank_id: 11
					}, {
						mark_of_mastery: 2,
						tank_id: 12
					}, {
						mark_of_mastery: 1,
						tank_id: 13
					}, {
						mark_of_mastery: 3,
						tank_id: 14
					}, {
						mark_of_mastery: 3,
						tank_id: 15
					}, {
						mark_of_mastery: 1,
						tank_id: 16
					}, {
						mark_of_mastery: 2,
						tank_id: 17
					}]
				}
			});

		callMasteryList(mocks.createMessage(null, 'bill93 [TC]'), {
			nickname: 'bill93',
			account_id: 100991247
		}, 'n').then(result => {
			st.deepEqual(result, {
				sentMsg: '@bill93 [TC], I did *not* find any tanks at "None".'
			}, 'responds with text saying no tank was found');

			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('long list (higher than 100 limit of tankopedia endpoint)', st => {
		const count = Math.floor(Math.random() * 99) + 101; // [101,200)
		const tankStats = nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '100991248',
				application_id,
				fields: 'mark_of_mastery,tank_id',
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
					'100991248': new Array(count).fill({
						mark_of_mastery: 3,
						tank_id: 0
					}).map((entry, index) => Object.assign({}, entry, {tank_id: index + 1}))
				}
			});
		const tankopedia1 = nock('https://api.wotblitz.com')
			.post('/wotb/encyclopedia/vehicles/', {
				application_id,
				fields: 'name,tier,nation',
				language: 'en',
				nation: '',
				tank_id: new Array(100).fill(0).map((_, index) => index + 1).join(',')
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 100
				},
				data: new Array(100).fill(1).reduce((dataObj, entry, index) => {
					dataObj[index + 1] = {
						name: 'Tank #' + (index + 1),
						tier: (index % 10) + 1,
						nation: 'ussr'
					};

					return dataObj;
				}, {})
			});
		const tankopedia2 = nock('https://api.wotblitz.com')
			.post('/wotb/encyclopedia/vehicles/', {
				application_id,
				fields: 'name,tier,nation',
				language: 'en',
				nation: '',
				tank_id: new Array(count - 100).fill(0).map((_, index) => index + 101).join(',')
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: count - 100
				},
				data: new Array(count - 100).fill(1).reduce((dataObj, entry, index) => {
					dataObj[index + 101] = {
						name: 'Tank #' + (index + 101),
						tier: (index % 10) + 1,
						nation: 'usa'
					};

					return dataObj;
				}, {})
			});

		callMasteryList(mocks.createMessage(null, 'tanker2 [TC]'), {
			nickname: 'tanker2',
			account_id: 100991248
		}, '1st').then(result => {
			st.ok(result.sentMsg.length > 1, 'sent multiple messages');

			const lineCount = result.sentMsg.join('\n').split('\n').length;

			st.equal(lineCount, count + 1, 'responded with the expected number of lines');
			st.equal(
				result.sentMsg[result.sentMsg.length - 1],
				'@tanker2 [TC], You have ' + count + ' tanks at 1st class, 100.00% of your ' + count + ' total tanks.',
				'last line of the response is correct'
			);

			st.ok(tankStats.isDone() && tankopedia1.isDone() && tankopedia2.isDone(), 'three requests were made');

			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.test('Missing tank_id', st => {
		const tankStats = nock('https://api.wotblitz.com')
			.post('/wotb/tanks/stats/', {
				access_token: '',
				account_id: '100991249',
				application_id,
				fields: 'mark_of_mastery,tank_id',
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
					'100991249': [{
						mark_of_mastery: 4,
						tank_id: 32786
					}]
				}
			});
		const tankopedia = nock('https://api.wotblitz.com')
			.post('/wotb/encyclopedia/vehicles/', {
				application_id,
				fields: 'name,tier,nation',
				language: 'en',
				nation: '',
				tank_id: '32786'
			})
			.reply(200, {
				status: 'ok',
				meta: {
					count: 1
				},
				data: {
					'32786': null
				}
			});

		callMasteryList(mocks.createMessage(null, 'youbounced [TC]'), {
			nickname: 'youbounced',
			account_id: 100991249
		}, 'm').then(result => {
			st.deepEqual(result, {
				sentMsg: [
					'@youbounced [TC], Vehicle not in tankopedia, 32786.',
					'You have 1 tanks at Mastery, 100.00% of your 1 total tanks.'
				].join('\n')
			}, 'responds with the "Mastery" list');

			st.ok(tankStats.isDone() && tankopedia.isDone(), 'two requests were made');

			st.end();
		}, error => {
			st.fail(error);
			st.end();
		});
	});

	t.end();
});
