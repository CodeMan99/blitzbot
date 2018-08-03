var test = require('tape');
var mocks = require('./mocks');
var cmdModule = require('../lib/command/index.js');
var Commands = cmdModule.Commands;
var Command = cmdModule.Command;
var createHelp = cmdModule.createHelp;

test('Command', t => {
	t.throws(() => new Command(), Error, 'constructor throws without arguments.');
	t.throws(() => new Command(() => {}), Error, 'constructor throws without a name.');
	t.doesNotThrow(() => new Command(() => {}, null, 'name'), 'constructor does not throw with a string name.');
	t.doesNotThrow(() => new Command(function name() { }), 'constructor does not throw with a function name.'); // eslint-disable-line max-len, prefer-arrow-callback
	t.ok(new Command(() => {}, null, 'instance'), 'constructor creates an instance.');
	t.deepEqual(new Command(() => {}, null, 'name').fn.options, {
		argCount: 0,
		argSplit: ' ',
		description: 'No description set.',
		passRecord: false,
		signatures: []
	}, 'default command options.');
	t.equal(
		new Command(() => {}, {argSplit: null}, 'name').fn.options.argSplit,
		null,
		'able to explicitly nullify argSplit option.'
	);
	t.end();
});

test('Commands', t => {
	t.ok(new Commands(), 'constructor creates an instance without arguments.');
	t.deepEqual(Object.keys(Commands.prototype), [], 'contains no commands by default.');
	t.notOk(Commands.has('setup'), 'can detect that a command has yet to be added.');

	Commands.add(new Command(() => {}, {alias: 's'}, 'setup'));

	t.ok(Commands.has('setup'), 'can detect that a command was added.');
	t.equal(Commands.get('s'), 'setup', 'can get a command by the alias.');

	// teardown
	delete Commands.prototype.setup;

	t.end();
});

test('createHelp', t => {
	t.doesNotThrow(createHelp, 'function does not throw.');

	var help = createHelp();

	t.equal(help.name, 'help', 'created command is named "help".');
	t.equal(typeof help.fn, 'function', 'created command has a function.');
	t.deepEqual(help.fn.options, {
		argCount: 1,
		argSplit: ' ',
		description: 'List of all known commands or get help for a particular command.',
		passRecord: false,
		signatures: [
			'@BOTNAME help [command]',
			'(in direct message) help [command]'
		]
	}, 'created commands options are specified.');

	var callHelp = help.fn.bind(mocks.commands);

	t.test('call help command without collection', st => {
		st.equal(Commands.has('help'), false, 'verify help is not part of the collection');

		callHelp(mocks.createMessage()).then(result => {
			st.deepEqual(result, {
				sentMsg: [
					'`@testbot help [command]` -- List of all known commands or get help for a particular command.',
					'`(in direct message) help [command]` -- List of all known commands or get help for a particular command.'
				]
			}, 'help adds its own description');

			st.end();
		}, error => { st.fail(error); st.end(); });
	});

	t.end();
});

test('Commands and help together.', t => {
	Commands.add(new Command(function echo(msg) { // eslint-disable-line prefer-arrow-callback
		return msg.channel.send(msg.content).then(sent => {
			return {sentMsg: sent};
		});
	}, {
		description: 'Echo whatever you say to me.',
		signatures: ['@BOTNAME echo']
	}));
	Commands.add(createHelp());

	var fakeClient = Object.assign({}, mocks.commands.client, {
		user: {
			username: 'testbot1'
		}
	});
	var fakeDb = {};
	var commands = new Commands(fakeClient, fakeDb);

	t.ok(commands.echo, 'has the echo command as a method');
	t.ok(commands.help, 'has the help command as a method');

	t.test('help, all commands', st => {
		commands.help(mocks.createMessage()).then(result => {
			st.deepEqual(result, {
				sentMsg: [
					'`@testbot1 echo` -- Echo whatever you say to me.',
					'`@testbot1 help [command]` -- List of all known commands or get help for a particular command.',
					'`(in direct message) help [command]` -- List of all known commands or get help for a particular command.'
				]
			}, 'help adds its own description.');

			st.end();
		}, error => { st.fail(error); st.end(); });
	});

	t.test('help, the "echo" command', st => {
		commands.help(mocks.createMessage(), 'echo').then(result => {
			st.deepEqual(result, {
				sentMsg: ['`@testbot1 echo` -- Echo whatever you say to me.']
			}, 'help can tell about a specific command.');

			st.end();
		}, error => { st.fail(error); st.end(); });
	});

	t.test('help, non-existant command', st => {
		st.equal(Commands.has('non-existant'), false, 'verify command does not exist');

		commands.help(mocks.createMessage(), 'non-existant').then(result => {
			st.deepEqual(result, {
				sentMsg: ['Unknown command: non-existant']
			}, 'response regardless of command');

			st.end();
		}, error => { st.fail(error); st.end(); });
	});

	t.test('call the "echo" command', st => {
		commands.echo(mocks.createMessage('repeat after me')).then(result => {
			st.deepEqual(result, {sentMsg: 'repeat after me'}, 'successful call to echo');
			st.end();
		}, error => { st.fail(error); st.end(); });
	});

	t.end();
});
