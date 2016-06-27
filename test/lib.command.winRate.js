var test = require('tape');
var nock = require('nock');
var mocks = require('./mocks');
var wr = require('../lib/command/winRate.js');
var callTankWinRate = wr.tankWinRate.fn.bind(mocks.commands);
var callWinRate = wr.winRate.fn.bind(mocks.commands);

test('command.winRate.tankWinRate', t => {
  t.deepEqual(wr.tankWinRate.fn.options, {
    argCount: 1,
    argSplit: null,
    description: 'Get your win rate for the given tank.',
    passRecord: true,
    signatures: ['@BOTNAME tank-win-rate <tank-name>'],
  }, 'verify options');

  t.equal(wr.tankWinRate.name, 'tank-win-rate', 'verify Commands method name');

  t.test('provided no argument', st => {
    callTankWinRate({author: 'dumb43 [CL]'}, {/* record */}).then(result => {
      st.deepEqual(result, {
        sentMsg: '@dumb43 [CL], Must specify a vehicle for "tank-win-rate".',
      }, 'tells the user to provide an argument');

      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  var encyclopediaRequestMock = () => {
    return nock('https://api.wotblitz.com')
      .post('/wotb/encyclopedia/vehicles/')
      .query({
        tank_id: null,
        nations: '',
        fields: 'name,nation,tier',
      })
      .reply(200, {
        status: 'ok',
        meta: {count: 224},
        data: {
          '1': {tier: 5, name: 'T-34', nation: 'ussr'},
          '17': {tier: 5, name: 'Pz.Kpfw. IV', nation: 'germany'},
          '33': {tier: 5, name: 'T14', nation: 'usa'},
          '49': {tier: 8, name: 'Type 59', nation: 'china'},
          '81': {tier: 1, name: 'Vickers Medium Mk. I', nation: 'uk'},
          '257': {tier: 5, name: 'SU-85', nation: 'ussr'},
          '337': {tier: 2, name: 'Vickers Medium Mk. II', nation: 'uk'},
          '353': {tier: 2, name: 'Chi-Ni', nation: 'japan'},
          '513': {tier: 7, name: 'IS', nation: 'ussr'},
          '529': {tier: 7, name: 'Tiger I', nation: 'germany'},
          '545': {tier: 1, name: 'T1 Cunningham', nation: 'usa'},
          '609': {tier: 1, name: 'Renault Otsu', nation: 'japan'},
          '769': {tier: 3, name: 'BT-7', nation: 'ussr'},
          '785': {tier: 2, name: 'Pz.Kpfw. 35 t', nation: 'germany'},
          '801': {tier: 6, name: 'M6', nation: 'usa'},
          '849': {tier: 4, name: 'Matilda', nation: 'uk'},
          '865': {tier: 2, name: 'Type 95 Ha-Go', nation: 'japan'},
          '1025': {tier: 2, name: 'BT-2', nation: 'ussr'},
          '1041': {tier: 5, name: 'StuG III Ausf. G', nation: 'germany'},
          '1057': {tier: 5, name: 'M4 Sherman', nation: 'usa'},
          '1105': {tier: 6, name: 'Cromwell', nation: 'uk'},
          '1121': {tier: 7, name: 'Type 5 Chi-Ri', nation: 'japan'},
          '1297': {tier: 7, name: 'Panther I', nation: 'germany'},
          '1313': {tier: 6, name: 'M4A3E8 Sherman', nation: 'usa'},
          '1377': {tier: 5, name: 'Type 3 Chi-Nu', nation: 'japan'},
          '1537': {tier: 4, name: 'T-28', nation: 'ussr'},
          '1553': {tier: 6, name: 'Jagdpanzer IV', nation: 'germany'},
          '1569': {tier: 7, name: 'T20', nation: 'usa'},
          '1633': {tier: 4, name: 'Type 1 Chi-He', nation: 'japan'},
          '1809': {tier: 4, name: 'Hetzer', nation: 'germany'},
          '1889': {tier: 6, name: 'Type 4 Chi-To', nation: 'japan'},
          '2049': {tier: 4, name: 'A-20', nation: 'ussr'},
          '2065': {tier: 2, name: 'Pz.Kpfw. II', nation: 'germany'},
          '2129': {tier: 5, name: 'Crusader', nation: 'uk'},
          '2145': {tier: 3, name: 'Type 97 Chi-Ha', nation: 'japan'},
          '2305': {tier: 7, name: 'SU-152', nation: 'ussr'},
          '2321': {tier: 6, name: 'VK 36.01 (H)', nation: 'germany'},
          '2385': {tier: 3, name: 'Vickers Medium Mk. III', nation: 'uk'},
          '2401': {tier: 3, name: 'Type 98 Ke-Ni', nation: 'japan'},
          '2561': {tier: 6, name: 'T-34-85', nation: 'ussr'},
          '2577': {tier: 5, name: 'VK 30.01 (H)', nation: 'germany'},
          '2593': {tier: 9, name: 'T30', nation: 'usa'},
          '2657': {tier: 8, name: 'STA-1', nation: 'japan'},
          '2817': {tier: 6, name: 'KV-1S', nation: 'ussr'},
          '2849': {tier: 8, name: 'T34', nation: 'usa'},
          '2897': {tier: 5, name: 'Churchill I', nation: 'uk'},
          '2913': {tier: 4, name: 'Type 5 Ke-Ho', nation: 'japan'},
          '3073': {tier: 3, name: 'T-46', nation: 'ussr'},
          '3089': {tier: 1, name: 'Leichttraktor', nation: 'germany'},
          '3105': {tier: 4, name: 'M3 Lee', nation: 'usa'},
          '3153': {tier: 7, name: 'Black Prince', nation: 'uk'},
          '3329': {tier: 1, name: 'MS-1', nation: 'ussr'},
          '3345': {tier: 3, name: 'Pz.Kpfw. 38 t', nation: 'germany'},
          '3361': {tier: 5, name: 'T1 Heavy Tank', nation: 'usa'},
          '3425': {tier: 9, name: 'Type 61', nation: 'japan'},
          '3585': {tier: 6, name: 'SU-100', nation: 'ussr'},
          '3601': {tier: 2, name: 'Panzerjäger I', nation: 'germany'},
          '3681': {tier: 10, name: 'STB-1', nation: 'japan'},
          '3857': {tier: 7, name: 'Jagdpanther', nation: 'germany'},
          '3873': {tier: 7, name: 'T29', nation: 'usa'},
          '3921': {tier: 8, name: 'Caernarvon', nation: 'uk'},
          '4113': {tier: 7, name: 'VK 30.02 (D)', nation: 'germany'},
          '4353': {tier: 8, name: 'T-44', nation: 'ussr'},
          '4369': {tier: 4, name: 'Pz.Kpfw. III', nation: 'germany'},
          '4385': {tier: 8, name: 'T32', nation: 'usa'},
          '4433': {tier: 9, name: 'Conqueror', nation: 'uk'},
          '4609': {tier: 2, name: 'T-26', nation: 'ussr'},
          '4689': {tier: 6, name: 'Churchill VII', nation: 'uk'},
          '4881': {tier: 3, name: 'Pz.Kpfw. III Ausf. A', nation: 'germany'},
          '4897': {tier: 3, name: 'M2 Medium Tank', nation: 'usa'},
          '5121': {tier: 2, name: 'AT-1', nation: 'ussr'},
          '5137': {tier: 8, name: 'Tiger II', nation: 'germany'},
          '5377': {tier: 8, name: 'IS-3', nation: 'ussr'},
          '5393': {tier: 5, name: 'VK 16.02 Leopard', nation: 'germany'},
          '5457': {tier: 7, name: 'Comet', nation: 'uk'},
          '5665': {tier: 2, name: 'T2 Medium Tank', nation: 'usa'},
          '5713': {tier: 9, name: 'Centurion Mk. 7/1', nation: 'uk'},
          '5889': {tier: 7, name: 'KV-3', nation: 'ussr'},
          '5921': {tier: 8, name: 'M26 Pershing', nation: 'usa'},
          '5969': {tier: 8, name: 'Centurion Mk. I', nation: 'uk'},
          '6145': {tier: 10, name: 'IS-4', nation: 'ussr'},
          '6161': {tier: 4, name: 'Pz.Kpfw. II Luchs', nation: 'germany'},
          '6177': {tier: 2, name: 'T18', nation: 'usa'},
          '6225': {tier: 10, name: 'FV215b', nation: 'uk'},
          '6401': {tier: 3, name: 'SU-76', nation: 'ussr'},
          '6417': {tier: 5, name: 'Pz.Kpfw. III/IV', nation: 'germany'},
          '6433': {tier: 3, name: 'T82', nation: 'usa'},
          '6481': {tier: 4, name: 'Covenanter', nation: 'uk'},
          '6657': {tier: 7, name: 'T-43', nation: 'ussr'},
          '6673': {tier: 3, name: 'Marder II', nation: 'germany'},
          '6913': {tier: 4, name: 'SU-85B', nation: 'ussr'},
          '6929': {tier: 10, name: 'Maus', nation: 'germany'},
          '6945': {tier: 5, name: 'M10 Wolverine', nation: 'usa'},
          '7169': {tier: 10, name: 'IS-7', nation: 'ussr'},
          '7185': {tier: 6, name: 'VK 30.01 (P)', nation: 'germany'},
          '7201': {tier: 6, name: 'M36 Jackson', nation: 'usa'},
          '7249': {tier: 10, name: 'FV4202', nation: 'uk'},
          '7425': {tier: 8, name: 'ISU-152', nation: 'ussr'},
          '7441': {tier: 9, name: 'VK 45.02 (P) Ausf. B', nation: 'germany'},
          '7505': {tier: 3, name: 'Cruiser Mk. IV', nation: 'uk'},
          '7697': {tier: 8, name: 'Ferdinand', nation: 'germany'},
          '7713': {tier: 4, name: 'T40', nation: 'usa'},
          '7761': {tier: 2, name: 'Cruiser Mk. III', nation: 'uk'},
          '7937': {tier: 9, name: 'T-54', nation: 'ussr'},
          '7953': {tier: 9, name: 'Jagdtiger', nation: 'germany'},
          '8017': {tier: 3, name: 'Valentine AT', nation: 'uk'},
          '8193': {tier: 9, name: 'Object 704', nation: 'ussr'},
          '8209': {tier: 4, name: 'Pz.Kpfw. 38 t n.A.', nation: 'germany'},
          '8225': {tier: 8, name: 'T28', nation: 'usa'},
          '8273': {tier: 2, name: 'Universal Carrier 2-pdr', nation: 'uk'},
          '8465': {tier: 8, name: 'Panther II', nation: 'germany'},
          '8529': {tier: 8, name: 'AT 15', nation: 'uk'},
          '8737': {tier: 9, name: 'T95', nation: 'usa'},
          '8785': {tier: 5, name: 'AT 2', nation: 'uk'},
          '8961': {tier: 7, name: 'KV-13', nation: 'ussr'},
          '8993': {tier: 9, name: 'M46 Patton', nation: 'usa'},
          '9041': {tier: 4, name: 'Alecto', nation: 'uk'},
          '9217': {tier: 8, name: 'IS-6', nation: 'ussr'},
          '9249': {tier: 7, name: 'T25 AT', nation: 'usa'},
          '9297': {tier: 10, name: 'FV215b (183)', nation: 'uk'},
          '9489': {tier: 10, name: 'E 100', nation: 'germany'},
          '9505': {tier: 9, name: 'M103', nation: 'usa'},
          '9553': {tier: 6, name: 'AT 8', nation: 'uk'},
          '9745': {tier: 9, name: 'E 75', nation: 'germany'},
          '9809': {tier: 6, name: 'Churchill Gun Carrier', nation: 'uk'},
          '9985': {tier: 8, name: 'SU-101', nation: 'ussr'},
          '10001': {tier: 6, name: 'VK 28.01', nation: 'germany'},
          '10017': {tier: 6, name: 'M4A3E2 Sherman Jumbo', nation: 'usa'},
          '10065': {tier: 7, name: 'AT 7', nation: 'uk'},
          '10241': {tier: 7, name: 'SU-100M1', nation: 'ussr'},
          '10257': {tier: 9, name: 'E 50', nation: 'germany'},
          '10273': {tier: 4, name: 'M8A1', nation: 'usa'},
          '10497': {tier: 6, name: 'KV-2', nation: 'ussr'},
          '10513': {tier: 8, name: 'VK 45.02 (P) Ausf. A', nation: 'germany'},
          '10529': {tier: 5, name: 'T49', nation: 'usa'},
          '10753': {tier: 9, name: 'ST-I', nation: 'ussr'},
          '10769': {tier: 7, name: 'Tiger (P)', nation: 'germany'},
          '10785': {tier: 10, name: 'T110E5', nation: 'usa'},
          '11009': {tier: 8, name: 'KV-4', nation: 'ussr'},
          '11041': {tier: 7, name: 'T25/2', nation: 'usa'},
          '11265': {tier: 6, name: 'T-150', nation: 'ussr'},
          '11297': {tier: 8, name: 'T28 Prototype', nation: 'usa'},
          '11521': {tier: 9, name: 'IS-8', nation: 'ussr'},
          '11537': {tier: 8, name: 'Jagdpanther II', nation: 'germany'},
          '11553': {tier: 6, name: 'M18 Hellcat', nation: 'usa'},
          '11777': {tier: 5, name: 'KV-1', nation: 'ussr'},
          '12033': {tier: 9, name: 'SU-122-54', nation: 'ussr'},
          '12049': {tier: 10, name: 'Jagdpanzer E 100', nation: 'germany'},
          '12305': {tier: 10, name: 'E 50 Ausf. M', nation: 'germany'},
          '13073': {tier: 3, name: 'Pz.Kpfw. II Ausf. G', nation: 'germany'},
          '13089': {tier: 10, name: 'T110E4', nation: 'usa'},
          '13329': {tier: 4, name: 'Durchbruchswagen 2', nation: 'germany'},
          '13345': {tier: 8, name: 'T26E4 SuperPershing', nation: 'usa'},
          '13569': {tier: 10, name: 'Object 268', nation: 'ussr'},
          '13825': {tier: 10, name: 'T-62A', nation: 'ussr'},
          '13841': {tier: 8, name: 'Indien-Panzer', nation: 'germany'},
          '13857': {tier: 10, name: 'T110E3', nation: 'usa'},
          '14097': {tier: 6, name: 'VK 30.01 (D)', nation: 'germany'},
          '14113': {tier: 10, name: 'M48A1 Patton', nation: 'usa'},
          '14337': {tier: 10, name: 'Object 263', nation: 'ussr'},
          '14609': {tier: 10, name: 'Leopard 1', nation: 'germany'},
          '14865': {tier: 9, name: 'Leopard Prototyp A', nation: 'germany'},
          '15889': {tier: 6, name: 'VK 30.02 (M)', nation: 'germany'},
          '16897': {tier: 10, name: 'Object 140', nation: 'ussr'},
          '17169': {tier: 3, name: 'Pz.Kpfw. IV Ausf. A', nation: 'germany'},
          '17425': {tier: 4, name: 'Pz.Kpfw. IV Ausf. D', nation: 'germany'},
          '18449': {tier: 8, name: 'Spähpanzer Ru 251', nation: 'germany'},
          '18961': {tier: 7, name: 'Spähpanzer SP I C', nation: 'germany'},
          '51201': {tier: 5, name: 'KV-220 Beta-Test', nation: 'ussr'},
          '51457': {tier: 5, name: 'Matilda IV', nation: 'ussr'},
          '51473': {tier: 5, name: 'Pz.Kpfw. V/IV', nation: 'germany'},
          '51489': {tier: 2, name: 'T2 Light Tank', nation: 'usa'},
          '51713': {tier: 5, name: 'Churchill III', nation: 'ussr'},
          '51729': {tier: 3, name: 'Pz.Kpfw. II Ausf. J', nation: 'germany'},
          '51745': {tier: 5, name: 'Ram II', nation: 'usa'},
          '51809': {tier: 3, name: 'Type 98 Ke-Ni Otsu', nation: 'japan'},
          '51985': {tier: 3, name: 'Pz.Kpfw. S35 739 (f)', nation: 'germany'},
          '52225': {tier: 3, name: 'BT-SV', nation: 'ussr'},
          '52241': {tier: 4, name: 'Pz.Kpfw. B2 740 (f)', nation: 'germany'},
          '52257': {tier: 5, name: 'M4A2E4 Sherman', nation: 'usa'},
          '52481': {tier: 4, name: 'Valentine II', nation: 'ussr'},
          '52497': {tier: 2, name: 'Pz.Kpfw. 38H 735 (f)', nation: 'germany'},
          '52561': {tier: 9, name: 'Tortoise', nation: 'uk'},
          '52737': {tier: 3, name: 'M3 Light', nation: 'ussr'},
          '52769': {tier: 3, name: 'M22 Locust', nation: 'usa'},
          '52993': {tier: 4, name: 'A-32', nation: 'ussr'},
          '53249': {tier: 8, name: 'KV-5', nation: 'ussr'},
          '53505': {tier: 3, name: 'T-127', nation: 'ussr'},
          '53537': {tier: 2, name: 'T1E6', nation: 'usa'},
          '53585': {tier: 5, name: 'Matilda Black Prince', nation: 'uk'},
          '53761': {tier: 5, name: 'SU-85I', nation: 'ussr'},
          '53841': {tier: 6, name: 'TOG II*', nation: 'uk'},
          '54097': {tier: 7, name: 'AT 15A', nation: 'uk'},
          '54289': {tier: 8, name: 'Löwe', nation: 'germany'},
          '54353': {tier: 5, name: 'Excelsior', nation: 'uk'},
          '54529': {tier: 2, name: 'Tetrarch', nation: 'ussr'},
          '54545': {tier: 5, name: 'T-25', nation: 'germany'},
          '54785': {tier: 6, name: 'SU-100Y', nation: 'ussr'},
          '54801': {tier: 3, name: 'T-15', nation: 'germany'},
          '55057': {tier: 5, name: 'Pz.Kpfw. IV hydrostat.', nation: 'germany'},
          '55073': {tier: 2, name: 'T7 Combat Car', nation: 'usa'},
          '55297': {tier: 7, name: 'SU-122-44', nation: 'ussr'},
          '55313': {tier: 8, name: '8,8 cm Pak 43 Jagdtiger', nation: 'germany'},
          '55889': {tier: 6, name: 'Cromwell B', nation: 'uk'},
          '56097': {tier: 6, name: 'M4A3E8 Fury', nation: 'usa'},
          '56577': {tier: 3, name: 'LTP', nation: 'ussr'},
          '57105': {tier: 6, name: 'Dicker Max', nation: 'germany'},
          '57361': {tier: 6, name: 'Pz.Kpfw. IV Schmalturm', nation: 'germany'},
          '57617': {tier: 7, name: 'Panther/M10', nation: 'germany'},
          '60417': {tier: 8, name: 'IS-3 Defender', nation: 'ussr'},
          '63585': {tier: 6, name: 'Kuro Mori Mine', nation: 'japan'},
          '63841': {tier: 5, name: 'Panzer IV Anko Special', nation: 'japan'},
          '64001': {tier: 7, name: 'T-34-85 Rudy', nation: 'ussr'},
          '64017': {tier: 7, name: 'Tankenstein', nation: 'germany'},
          '64065': {tier: 8, name: 'FCM 50 t', nation: 'france'},
          '64257': {tier: 6, name: 'T-34-85 Victory', nation: 'ussr'},
          '64273': {tier: 8, name: 'Snowstorm Jagdtiger 8.8', nation: 'germany'},
          '64529': {tier: 7, name: 'E 25', nation: 'germany'},
          '64593': {tier: 5, name: 'Angry Connor', nation: 'uk'},
          '64769': {tier: 8, name: 'IS-6 Fearless', nation: 'ussr'},
          '64801': {tier: 8, name: 'T34 Independence', nation: 'usa'},
          '64849': {tier: 4, name: 'AC 1 Sentinel', nation: 'uk'},
          '65329': {tier: 7, name: 'Type 62', nation: 'china'},
          '65377': {tier: 5, name: 'Type 3 Chi-Nu Kai', nation: 'japan'},
        },
      });
  };

  t.test('no tank name matches argument', st => {
    var tankopediaVehicles = encyclopediaRequestMock();

    callTankWinRate({author: 'jake81 [CL]'}, {account_id: 100996734}, 'no tank matches').then(result => {
      st.notOk(result, 'resolves without a response');
      st.ok(tankopediaVehicles.isDone(), 'make one api call');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('argument is a valid tank, but has no record', st => {
    var tankopediaVehicles = encyclopediaRequestMock();
    var tankStats = nock('https://api.wotblitz.com')
      .post('/wotb/tanks/stats/')
      .query({
        account_id: 100998143,
        tank_id: 55073,
        in_garage: null,
        fields: 'tank_id,all.battles,all.wins',
        access_token: null,
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {
          count: 1,
        },
        data: {
          '100998143': null,
        },
      });

    callTankWinRate({author: 'meganthetanker [CL]'}, {account_id: 100998143}, 'T7 Combat Car').then(result => {
      st.deepEqual(result, {
        sentMsg: '@meganthetanker [CL], I found no stats related to your search.',
      }, 'verify response explains that the tank has yet to be played');

      st.ok(tankopediaVehicles.isDone() && tankStats.isDone(), 'make two api calls');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('argument returns one tank', st => {
    var tankopediaVehicles = encyclopediaRequestMock();
    var tankStats = nock('https://api.wotblitz.com')
      .post('/wotb/tanks/stats/')
      .query({
        account_id: 100998144,
        tank_id: 54289,
        in_garage: null,
        fields: 'tank_id,all.battles,all.wins',
        access_token: null,
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {
          count: 1,
        },
        data: {
          '100998144': [
            {
              all: {
                battles: 283,
                wins: 159,
              },
              tank_id: 54289,
            },
          ],
        },
      });

    callTankWinRate({author: 'hulkhogan [CL]'}, {account_id: 100998144}, 'Löwe').then(result => {
      st.deepEqual(result, {
        sentMsg: '@hulkhogan [CL], Löwe (germany, 8): 56.18% after 283 battles.',
      }, 'verify response');

      st.ok(tankopediaVehicles.isDone() && tankStats.isDone(), 'make two api calls');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('argument returns two tanks', st => {
    var tankopediaVehicles = encyclopediaRequestMock();
    var tankStats = nock('https://api.wotblitz.com')
      .post('/wotb/tanks/stats/')
      .query({
        account_id: 100998145,
        tank_id: '5921,13345',
        in_garage: null,
        fields: 'tank_id,all.battles,all.wins',
        access_token: null,
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {
          count: 1,
        },
        data: {
          '100998145': [
            {
              all: {
                battles: 534,
                wins: 383,
              },
              tank_id: 5921,
            },
            {
              all: {
                battles: 74,
                wins: 39,
              },
              tank_id: 13345,
            },
          ],
        },
      });

    callTankWinRate({author: 'jessie5 [CL]'}, {account_id: 100998145}, 'Pershing').then(result => {
      st.deepEqual(result, {
        sentMsg: [
          '@jessie5 [CL], M26 Pershing (usa, 8): 71.72% after 534 battles.',
          'T26E4 SuperPershing (usa, 8): 52.70% after 74 battles.',
        ].join('\n'),
      }, 'verify response');

      st.ok(tankopediaVehicles.isDone() && tankStats.isDone(), 'make two api calls');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('argument matches more than 100 limit of tankopedia endpoint', st => {
    var tankopediaVehicles = encyclopediaRequestMock();

    callTankWinRate({author: 'noshootingheretonight'}, {account_id: 100998146}, 't').then(result => {
      st.deepEqual(result, {sentMsg: '@noshootingheretonight, Found too many vehicles with `t`.'}, 'verify response');
      st.ok(tankopediaVehicles.isDone(), 'make one api call');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.end();
});

test('command.winRate.winRate', t => {
  t.deepEqual(wr.winRate.fn.options, {
    argCount: 0,
    argSplit: ' ',
    description: 'Get the win rate of your account.',
    passRecord: true,
    signatures: ['@BOTNAME win-rate'],
  }, 'verify options');

  t.equal(wr.winRate.name, 'win-rate', 'verify Commands method name');

  var requestMock = (accountId, wins, battles) => {
    return nock('https://api.wotblitz.com')
      .post('/wotb/account/info/')
      .query({
        account_id: accountId,
        extra: null,
        fields: 'statistics.all.battles,statistics.all.wins',
        application_id: process.env.APPLICATION_ID,
      })
      .reply(200, {
        status: 'ok',
        meta: {
          count: 1,
        },
        data: {
          [accountId]: {
            statistics: {
              all: {
                battles: battles,
                wins: wins,
              },
            },
          },
        },
      });
  };

  t.test('initial call', st => {
    var accountInfo = requestMock(100994563, 8691, 14280);

    callWinRate({author: 'bigguy20 [CL]'}, {account_id: 100994563}).then(result => {
      st.deepEqual(result, {
        sentMsg: '@bigguy20 [CL], You have won 8691 of 14280 battles. That is 60.86% victory!',
        updateFields: {
          wins: 8691,
          battles: 14280,
        },
      }, 'verify response and record update');

      st.ok(accountInfo.isDone(), 'made one API call');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('follow up call, no additional battles', st => {
    var accountInfo = requestMock(100994564, 7682, 18290);

    callWinRate({author: 'littleguy21 [CL]'}, {account_id: 100994564, wins: 7682, battles: 18290}).then(result => {
      st.deepEqual(result, {
        sentMsg: '@littleguy21 [CL], You have won 7682 of 18290 battles. That is 42.00% victory!',
        updateFields: {
          wins: 7682,
          battles: 18290,
        },
      }, 'verify response and record update');

      st.ok(accountInfo.isDone(), 'made one API call');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('follow up call, one additional battle', st => {
    var accountInfo = requestMock(100994565, 9260, 13933);

    callWinRate({author: 'biggirl22 [CL]'}, {account_id: 100994565, wins: 9259, battles: 13932}).then(result => {
      st.deepEqual(result, {
        sentMsg: [
          '@biggirl22 [CL], You have won 9260 of 13933 battles. That is 66.46% victory!',
          'Last time you asked was 1 battles ago, at 66.46% victory.',
          'Over those 1 battles, you won 100.00%!',
        ].join('\n'),
        updateFields: {
          wins: 9260,
          battles: 13933,
        },
      }, 'verify response and record update');

      st.ok(accountInfo.isDone(), 'made one API call');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('follow up call, several additional battles', st => {
    var accountInfo = requestMock(100994566, 5003, 11502);

    callWinRate({author: 'littlegirl23 [CL]'}, {account_id: 100994566, wins: 4992, battles: 11483}).then(result => {
      st.deepEqual(result, {
        sentMsg: [
          '@littlegirl23 [CL], You have won 5003 of 11502 battles. That is 43.50% victory!',
          'Last time you asked was 19 battles ago, at 43.47% victory.',
          'Over those 19 battles, you won 57.89%!',
        ].join('\n'),
        updateFields: {
          wins: 5003,
          battles: 11502,
        },
      }, 'verify response and record update');

      st.ok(accountInfo.isDone(), 'made one API call');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.end();
});
