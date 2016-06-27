var test = require('tape');
var mockery = require('mockery');
var mocks = require('./mocks');

mockery.registerAllowable('./index.js');
mockery.registerAllowable('../lib/command/development.js');
mockery.registerMock('../../package.json', {
  name: 'testname',
  version: '1.3.4',
  changeLog: {
    '1.3.4': [
      'change 2',
      'change 1',
    ],
    '1.3.3': [
      'fix 2',
      'fix 1',
    ],
  },
});
mockery.enable();

var dev = require('../lib/command/development.js');

mockery.disable();
mockery.deregisterAll();

var callChanges = dev.changes.fn.bind(mocks.commands);
var callVersion = dev.version.fn.bind(mocks.commands);

test('development.changes', t => {
  t.deepEqual(dev.changes.fn.options, {
    argCount: 1,
    argSplit: ' ',
    description: 'Get the update notes from the author (defaults to the current version).',
    passRecord: false,
    signatures: ['@BOTNAME changes [version]'],
  }, 'verify options');

  t.equal(dev.changes.name, 'changes', 'verify Commands method name');

  t.test('no version argument', st => {
    callChanges({author: 'bill32'}).then(result => {
      st.deepEqual(result, {
        sentMsg: [
          '@bill32, Change Log for `testname`, version **1.3.4**.',
          'change 2',
          'change 1',
        ].join('\n'),
      }, 'sent message about current version');

      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('valid version argument', st => {
    callChanges({author: 'greg14'}, '1.3.3').then(result => {
      st.deepEqual(result, {
        sentMsg: [
          '@greg14, Change Log for `testname`, version **1.3.3**.',
          'fix 2',
          'fix 1',
        ].join('\n'),
      }, 'sent message about specifed version');

      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.test('invalid version argument', st => {
    callChanges({author: 'jack81'}, '1.3.5').then(result => {
      st.notOk(result, 'no response without error');
      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.end();
});

test('development.version', t => {
  t.deepEqual(dev.version.fn.options, {
    argCount: 0,
    argSplit: ' ',
    description: 'Replies the current blitzbot version.',
    passRecord: false,
    signatures: ['@BOTNAME version'],
  }, 'verify options');

  t.equal(dev.changes.name, 'changes', 'verify Commands method name');

  t.test('valid call', st => {
    callVersion({author: 'joe65'}).then(result => {
      st.deepEqual(result, {
        sentMsg: '@joe65, testname version 1.3.4, written by <@86558039594774528>',
      }, 'valid response.');

      st.end();
    }, error => { st.fail(error); st.end(); });
  });

  t.end();
});
