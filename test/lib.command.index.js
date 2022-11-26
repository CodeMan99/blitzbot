const test = require('tape');
const {autoEndTest} = require('./.utility.js');
const mocks = require('./mocks');
const cmdModule = require('../lib/command/index.js');
const Commands = cmdModule.Commands;
const Command = cmdModule.Command;
const createHelp = cmdModule.createHelp;

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

	const help = createHelp();

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

	const callHelp = help.fn.bind(mocks.commands);

	t.test('call help command without collection', autoEndTest(async st => {
		st.equal(Commands.has('help'), false, 'verify help is not part of the collection');

		const result = await callHelp(mocks.createMessage());

		st.deepEqual(result, {
			sentMsg: [
				'`@testbot help [command]` -- List of all known commands or get help for a particular command.',
				'`(in direct message) help [command]` -- List of all known commands or get help for a particular command.'
			]
		}, 'help adds its own description');
	}));

	t.end();
});

test('Commands and help together.', t => {
	Commands.add(new Command(async function echo(msg) { // eslint-disable-line prefer-arrow-callback
		const sent = await msg.channel.send(msg.content);

		return {sentMsg: sent};
	}, {
		description: 'Echo whatever you say to me.',
		signatures: ['@BOTNAME echo']
	}));
	Commands.add(createHelp());

	const fakeClient = Object.assign({}, mocks.commands.client, {
		user: {
			username: 'testbot1'
		}
	});
	const fakeDb = {};
	const commands = new Commands(fakeClient, fakeDb);

	t.ok(commands.echo, 'has the echo command as a method');
	t.ok(commands.help, 'has the help command as a method');

	t.test('help, all commands', autoEndTest(async st => {
		const result = await commands.help(mocks.createMessage());

		st.deepEqual(result, {
			sentMsg: [
				'`@testbot1 echo` -- Echo whatever you say to me.',
				'`@testbot1 help [command]` -- List of all known commands or get help for a particular command.',
				'`(in direct message) help [command]` -- List of all known commands or get help for a particular command.'
			]
		}, 'help adds its own description.');
	}));

	t.test('help, the "echo" command', autoEndTest(async st => {
		const result = await commands.help(mocks.createMessage(), 'echo');

		st.deepEqual(result, {
			sentMsg: ['`@testbot1 echo` -- Echo whatever you say to me.']
		}, 'help can tell about a specific command.');
	}));

	t.test('help, non-existant command', autoEndTest(async st => {
		st.equal(Commands.has('non-existant'), false, 'verify command does not exist');

		const result = await commands.help(mocks.createMessage(), 'non-existant');

		st.deepEqual(result, {
			sentMsg: ['Unknown command: non-existant']
		}, 'response regardless of command');
	}));

	t.test('call the "echo" command', autoEndTest(async st => {
		const result = await commands.echo(mocks.createMessage('repeat after me'));

		st.deepEqual(result, {sentMsg: 'repeat after me'}, 'successful call to echo');
	}));

	t.end();
});
