var test = require('tape');
var nock = require('nock');
var masteryList = require('../lib/command/masteryList.js');
var callMasteryList = masteryList.fn.bind({
  client: {
    reply: (message, text) => Promise.resolve(`@${message.author}, ${text}`),
  },
});

test('command.masteryList', (t) => {
  t.deepEqual(masteryList.fn.options, {
    argCount: 1,
    argSplit: null,
    description: 'List tanks at the given mastery level (defaults to "Mastery").',
    passRecord: true,
    signatures: ['@BOTNAME mastery-list [level]'],
  }, 'verify options');

  t.equal(masteryList.name, 'mastery-list', 'verify Commands method name');

  t.test('no argument default', (st) => {
    nock('https://api.wotblitz.com')
      .post('/wotb/tanks/stats/')
      .query({
        account_id: 100991240,
        tank_id: null,
        in_garage: null,
        fields: 'mark_of_mastery,tank_id',
        access_token: null,
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {count: 1},
        data: {
          '100991240': [
            {mark_of_mastery: 0, tank_id: 1},
            {mark_of_mastery: 1, tank_id: 2},
            {mark_of_mastery: 2, tank_id: 3},
            {mark_of_mastery: 3, tank_id: 4},
            {mark_of_mastery: 4, tank_id: 5},
            {mark_of_mastery: 0, tank_id: 6},
            {mark_of_mastery: 1, tank_id: 7},
            {mark_of_mastery: 2, tank_id: 8},
            {mark_of_mastery: 3, tank_id: 9},
            {mark_of_mastery: 4, tank_id: 10},
          ],
        },
      });

    nock('https://api.wotblitz.com')
      .post('/wotb/encyclopedia/vehicles/')
      .query({
        tank_id: '5,10',
        fields: 'name,tier,nation',
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {count: 2},
        data: {
          '5': {name: 'T-34', tier: 5, nation: 'ussr'},
          '10': {name: 'T1 Heavy', tier: 5, nation: 'usa'},
        },
      });

    callMasteryList({author: 'john2 [TC]'}, {nickname: 'john2', account_id: 100991240}).then(result => {
      st.deepEqual(result, {
        sentMsg: [
          '@john2 [TC], You have 2 tanks at Mastery, 20.00% of your 10 total tanks.',
          'T-34 (ussr, 5)',
          'T1 Heavy (usa, 5)',
        ].join('\n'),
      }, 'responds with the "Mastery" list');

      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('list "none"', (st) => {
    nock('https://api.wotblitz.com')
      .post('/wotb/tanks/stats/')
      .query({
        account_id: 100991241,
        tank_id: null,
        in_garage: null,
        fields: 'mark_of_mastery,tank_id',
        access_token: null,
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {count: 1},
        data: {
          '100991241': [
            {mark_of_mastery: 0, tank_id: 1},
            {mark_of_mastery: 1, tank_id: 2},
            {mark_of_mastery: 2, tank_id: 3},
            {mark_of_mastery: 3, tank_id: 4},
            {mark_of_mastery: 4, tank_id: 5},
            {mark_of_mastery: 0, tank_id: 6},
            {mark_of_mastery: 1, tank_id: 7},
            {mark_of_mastery: 2, tank_id: 8},
            {mark_of_mastery: 3, tank_id: 9},
            {mark_of_mastery: 4, tank_id: 10},
            {mark_of_mastery: 0, tank_id: 11},
          ],
        },
      });

    nock('https://api.wotblitz.com')
      .post('/wotb/encyclopedia/vehicles/')
      .query({
        tank_id: '1,6,11',
        fields: 'name,tier,nation',
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {count: 2},
        data: {
          '1': {name: 'Löwe', tier: 8, nation: 'germany'},
          '6': {name: 'Centurion Mk. I', tier: 8, nation: 'uk'},
          '11': {name: 'STA-1', tier: 8, nation: 'japan'},
        },
      });

    callMasteryList({author: 'bill4 [TC]'}, {nickname: 'bill4', account_id: 100991241}, 'none').then(result => {
      st.deepEqual(result, {
        sentMsg: [
          '@bill4 [TC], You have 3 tanks at None, 27.27% of your 11 total tanks.',
          'Löwe (germany, 8)',
          'Centurion Mk. I (uk, 8)',
          'STA-1 (japan, 8)',
        ].join('\n'),
      }, 'responds with the "None" list');

      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('list "3rd class"', (st) => {
    nock('https://api.wotblitz.com')
      .post('/wotb/tanks/stats/')
      .query({
        account_id: 100991242,
        tank_id: null,
        in_garage: null,
        fields: 'mark_of_mastery,tank_id',
        access_token: null,
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {count: 1},
        data: {
          '100991242': [
            {mark_of_mastery: 0, tank_id: 1},
            {mark_of_mastery: 1, tank_id: 2},
            {mark_of_mastery: 2, tank_id: 3},
            {mark_of_mastery: 3, tank_id: 4},
            {mark_of_mastery: 4, tank_id: 5},
            {mark_of_mastery: 0, tank_id: 6},
            {mark_of_mastery: 1, tank_id: 7},
            {mark_of_mastery: 2, tank_id: 8},
            {mark_of_mastery: 3, tank_id: 9},
            {mark_of_mastery: 4, tank_id: 10},
            {mark_of_mastery: 0, tank_id: 11},
            {mark_of_mastery: 1, tank_id: 12},
            {mark_of_mastery: 2, tank_id: 13},
            {mark_of_mastery: 3, tank_id: 14},
          ],
        },
      });

    nock('https://api.wotblitz.com')
      .post('/wotb/encyclopedia/vehicles/')
      .query({
        tank_id: '2,7,12',
        fields: 'name,tier,nation',
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {count: 3},
        data: {
          '2': {name: 'T-26', tier: 2, nation: 'ussr'},
          '7': {name: 'Pz.Kpfw. II', tier: 2, nation: 'germany'},
          '12': {name: 'T2 Medium Tank', tier: 2, nation: 'usa'},
        },
      });

    callMasteryList({author: 'greg3 [TC]'}, {nickname: 'greg3', account_id: 100991242}, '3rd class').then(result => {
      st.deepEqual(result, {
        sentMsg: [
          '@greg3 [TC], You have 3 tanks at 3rd class, 21.43% of your 14 total tanks.',
          'T-26 (ussr, 2)',
          'Pz.Kpfw. II (germany, 2)',
          'T2 Medium Tank (usa, 2)',
        ].join('\n'),
      }, 'responds with the "3rd class" list');

      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('list "2nd class"', (st) => {
    nock('https://api.wotblitz.com')
      .post('/wotb/tanks/stats/')
      .query({
        account_id: 100991243,
        tank_id: null,
        in_garage: null,
        fields: 'mark_of_mastery,tank_id',
        access_token: null,
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {count: 1},
        data: {
          '100991243': [
            {mark_of_mastery: 0, tank_id: 1},
            {mark_of_mastery: 1, tank_id: 2},
            {mark_of_mastery: 2, tank_id: 3},
            {mark_of_mastery: 3, tank_id: 4},
            {mark_of_mastery: 4, tank_id: 5},
            {mark_of_mastery: 0, tank_id: 6},
            {mark_of_mastery: 1, tank_id: 7},
            {mark_of_mastery: 2, tank_id: 8},
            {mark_of_mastery: 3, tank_id: 9},
            {mark_of_mastery: 4, tank_id: 10},
            {mark_of_mastery: 2, tank_id: 11},
            {mark_of_mastery: 2, tank_id: 12},
            {mark_of_mastery: 2, tank_id: 13},
          ],
        },
      });

    nock('https://api.wotblitz.com')
      .post('/wotb/encyclopedia/vehicles/')
      .query({
        tank_id: '3,8,11,12,13',
        fields: 'name,tier,nation',
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {count: 5},
        data: {
          '3': {name: 'BT-2', tier: 2, nation: 'ussr'},
          '8': {name: 'Pz.Kpfw. II Ausf. G', tier: 3, nation: 'germany'},
          '11': {name: 'Vickers Medium Mk. II', tier: 2, nation: 'uk'},
          '12': {name: 'M2 Medium Tank', tier: 3, nation: 'usa'},
          '13': {name: 'Pz.Kpfw. 38 (t)', tier: 3, nation: 'germany'},
        },
      });

    callMasteryList({author: 'dude9 [TC]'}, {nickname: 'dude9', account_id: 100991243}, '2nd class').then(result => {
      st.deepEqual(result, {
        sentMsg: [
          '@dude9 [TC], You have 5 tanks at 2nd class, 38.46% of your 13 total tanks.',
          'BT-2 (ussr, 2)',
          'Pz.Kpfw. II Ausf. G (germany, 3)',
          'Vickers Medium Mk. II (uk, 2)',
          'M2 Medium Tank (usa, 3)',
          'Pz.Kpfw. 38 (t) (germany, 3)',
        ].join('\n'),
      }, 'responds with the "2nd class" list');

      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('list "1st class"', (st) => {
    nock('https://api.wotblitz.com')
      .post('/wotb/tanks/stats/')
      .query({
        account_id: 100991244,
        tank_id: null,
        in_garage: null,
        fields: 'mark_of_mastery,tank_id',
        access_token: null,
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {count: 1},
        data: {
          '100991244': [
            {mark_of_mastery: 0, tank_id: 1},
            {mark_of_mastery: 1, tank_id: 2},
            {mark_of_mastery: 2, tank_id: 3},
            {mark_of_mastery: 3, tank_id: 4},
            {mark_of_mastery: 4, tank_id: 5},
            {mark_of_mastery: 0, tank_id: 6},
            {mark_of_mastery: 1, tank_id: 7},
            {mark_of_mastery: 2, tank_id: 8},
            {mark_of_mastery: 3, tank_id: 9},
            {mark_of_mastery: 4, tank_id: 10},
            {mark_of_mastery: 3, tank_id: 11},
            {mark_of_mastery: 0, tank_id: 12},
            {mark_of_mastery: 4, tank_id: 13},
          ],
        },
      });

    nock('https://api.wotblitz.com')
      .post('/wotb/encyclopedia/vehicles/')
      .query({
        tank_id: '4,9,11',
        fields: 'name,tier,nation',
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {count: 3},
        data: {
          '4': {name: 'M4 Sherman', tier: 5, nation: 'usa'},
          '9': {name: 'Covenanter', tier: 4, nation: 'uk'},
          '11': {name: 'Type 3 Chi-Nu Kai', tier: 5, nation: 'japan'},
        },
      });

    callMasteryList({author: 'bigjoe [TC]'}, {nickname: 'bigjoe', account_id: 100991244}, '1st class').then(result => {
      st.deepEqual(result, {
        sentMsg: [
          '@bigjoe [TC], You have 3 tanks at 1st class, 23.08% of your 13 total tanks.',
          'M4 Sherman (usa, 5)',
          'Covenanter (uk, 4)',
          'Type 3 Chi-Nu Kai (japan, 5)',
        ].join('\n'),
      }, 'responds with the "1st class" list');

      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('list "m"', (st) => {
    nock('https://api.wotblitz.com')
      .post('/wotb/tanks/stats/')
      .query({
        account_id: 100991245,
        tank_id: null,
        in_garage: null,
        fields: 'mark_of_mastery,tank_id',
        access_token: null,
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {count: 1},
        data: {
          '100991245': [
            {mark_of_mastery: 0, tank_id: 1},
            {mark_of_mastery: 1, tank_id: 2},
            {mark_of_mastery: 2, tank_id: 3},
            {mark_of_mastery: 3, tank_id: 4},
            {mark_of_mastery: 4, tank_id: 5},
            {mark_of_mastery: 0, tank_id: 6},
            {mark_of_mastery: 1, tank_id: 7},
            {mark_of_mastery: 2, tank_id: 8},
            {mark_of_mastery: 3, tank_id: 9},
            {mark_of_mastery: 4, tank_id: 10},
            {mark_of_mastery: 0, tank_id: 11},
            {mark_of_mastery: 0, tank_id: 12},
            {mark_of_mastery: 0, tank_id: 13},
            {mark_of_mastery: 0, tank_id: 14},
            {mark_of_mastery: 0, tank_id: 15},
            {mark_of_mastery: 0, tank_id: 16},
            {mark_of_mastery: 0, tank_id: 17},
          ],
        },
      });

    nock('https://api.wotblitz.com')
      .post('/wotb/encyclopedia/vehicles/')
      .query({
        tank_id: '5,10',
        fields: 'name,tier,nation',
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {count: 2},
        data: {
          '5': {name: 'T-34', tier: 5, nation: 'ussr'},
          '10': {name: 'T1 Heavy', tier: 5, nation: 'usa'},
        },
      });

    callMasteryList({author: 'lilgal [TC]'}, {nickname: 'lilgal', account_id: 100991245}, 'm').then(result => {
      st.deepEqual(result, {
        sentMsg: [
          '@lilgal [TC], You have 2 tanks at Mastery, 11.76% of your 17 total tanks.',
          'T-34 (ussr, 5)',
          'T1 Heavy (usa, 5)',
        ].join('\n'),
      }, 'responds with the "Mastery" list');

      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('invalid level argument', (st) => {
    callMasteryList({author: 'jake48 [TC]'}, {nickname: 'jake48', account_id: 100991246}, 'third class').then(result => {
      st.notOk(result, 'resolved without a response');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('empty list', (st) => {
    nock('https://api.wotblitz.com')
      .post('/wotb/tanks/stats/')
      .query({
        account_id: 100991247,
        tank_id: null,
        in_garage: null,
        fields: 'mark_of_mastery,tank_id',
        access_token: null,
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {count: 1},
        data: {
          '100991247': [
            {mark_of_mastery: 4, tank_id: 1},
            {mark_of_mastery: 1, tank_id: 2},
            {mark_of_mastery: 2, tank_id: 3},
            {mark_of_mastery: 3, tank_id: 4},
            {mark_of_mastery: 3, tank_id: 5},
            {mark_of_mastery: 4, tank_id: 6},
            {mark_of_mastery: 1, tank_id: 7},
            {mark_of_mastery: 2, tank_id: 8},
            {mark_of_mastery: 3, tank_id: 9},
            {mark_of_mastery: 2, tank_id: 10},
            {mark_of_mastery: 4, tank_id: 11},
            {mark_of_mastery: 2, tank_id: 12},
            {mark_of_mastery: 1, tank_id: 13},
            {mark_of_mastery: 3, tank_id: 14},
            {mark_of_mastery: 3, tank_id: 15},
            {mark_of_mastery: 1, tank_id: 16},
            {mark_of_mastery: 2, tank_id: 17},
          ],
        },
      });

    callMasteryList({author: 'bill93 [TC]'}, {nickname: 'bill93', account_id: 100991247}, 'n').then(result => {
      st.deepEqual(result, {
        sentMsg: '@bill93 [TC], I did *not* find any tanks at "None".',
      }, 'responds with text saying no tank was found');

      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('long list (higher than 100 limit of tankopedia endpoint)', (st) => {
    var count = Math.floor(Math.random() * 99) + 101; // [101,200)
    var tankStats = nock('https://api.wotblitz.com')
      .post('/wotb/tanks/stats/')
      .query({
        account_id: 100991248,
        tank_id: null,
        in_garage: null,
        fields: 'mark_of_mastery,tank_id',
        access_token: null,
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {count: 1},
        data: {
          '100991248': new Array(count).fill({mark_of_mastery: 3, tank_id: 0}).map((entry, index) => {
            entry.tank_id = index + 1;

            return entry;
          }),
        },
      });
    var tankopedia1 = nock('https://api.wotblitz.com')
      .post('/wotb/encyclopedia/vehicles/')
      .query({
        tank_id: new Array(100).fill(0).map((_, index) => index + 1).join(','),
        fields: 'name,tier,nation',
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {count: 100},
        data: new Array(100).fill(1).reduce((dataObj, entry, index) => {
          dataObj[index + 1] = {
            name: 'Tank #' + (index + 1),
            tier: (index % 10) + 1,
            nation: 'ussr',
          };

          return dataObj;
        }, {}),
      });
    var tankopedia2 = nock('https://api.wotblitz.com')
      .post('/wotb/encyclopedia/vehicles/')
      .query({
        tank_id: new Array(count - 100).fill(0).map((_, index) => index + 101).join(','),
        fields: 'name,tier,nation',
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {count: count - 100},
        data: new Array(count - 100).fill(1).reduce((dataObj, entry, index) => {
          dataObj[index + 101] = {
            name: 'Tank #' + (index + 101),
            tier: (index % 10) + 1,
            nation: 'usa',
          };

          return dataObj;
        }, {}),
      });

    callMasteryList({author: 'tanker2 [TC]'}, {nickname: 'tanker2', account_id: 100991248}, '1st').then(result => {
      var lines = result.sentMsg.split('\n');

      st.equal(lines.length, count + 1, 'responded with the expected number of lines');
      st.equal(
        lines[0],
        '@tanker2 [TC], You have ' + count + ' tanks at 1st class, 100.00% of your ' + count + ' total tanks.',
        'first line of the response is correct'
      );

      st.ok(tankStats.isDone() && tankopedia1.isDone() && tankopedia2.isDone(), 'three requests were made');

      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.end();
});
