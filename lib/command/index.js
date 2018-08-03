module.exports = {
	'Commands': Commands,
	'Command': Command,
	'createHelp': createHelp
};

/**
 * A static collection class of <Command>.
 * Added <Command> instances become methods of this collection.
 *
 * @example
 * if (Commands.has('command')) {
 *   // call the command, being careful to preverse the instance
 *   Commands.prototype['command'].call(commands, msg, record);
 * }
 *
 * @constructor
 * @param {discord.Client} discordClient a discord.js instance; Note no check is performed to ensure initialization is complete
 * @param {Datastore} nedbConnection     a nedb instacnce; Note no check is performed to ensure initialization is complete
 * @parem {wotblitz} wotblitz            a wotblitz instance
 */
function Commands(discordClient, nedbConnection, wotblitz) {
	this.client = discordClient;
	this.db = nedbConnection;
	this.wotblitz = wotblitz;
}

/**
 * Add a <Command> into the Commands collections.
 *
 * @example
 * // add the "fn" of the given command to Commands.prototype
 * Commands.add(new Command());
 *
 * @param {Command} command an instance, must have "name" and "fn" properties
 */
Commands.add = function addCommand(command) {
	if (command && command.name && typeof command.name === 'string' && typeof command.fn === 'function') {
		Commands.prototype[command.name] = command.fn;
	} else {
		throw new Error('addCommand: command must have name & fn properties');
	}
};

/**
 * Existance of a command in the collection.
 *
 * @param {string} cmdName the command name to look for.
 * @returns {boolean} true when the command exists.
 */
Commands.has = function hasCommand(cmdName) {
	return (cmdName in Commands.prototype) || Commands.get(cmdName) !== null;
};

/**
 * Get the method name of a command from the collection.
 *
 * @param {string} cmdName the command name to look for.
 * @returns {string} the fully resolved method name for the command.
 */
Commands.get = function getCommand(cmdName) {
	for (var [name, command] of Object.entries(Commands.prototype)) {
		if (name === cmdName || command.options.alias === cmdName) {
			return name;
		}
	}

	return null;
};

/**
 * A commandFn should be executed within context of the <Commands> collection.
 * @callback commandFn
 * @param {discord.Message} msg a discord.js message that contains the call to the command.
 * @param {Object} [record]     a query result that is passed when the option "passRecord" is true.
 * @param {...string} [args]    arguments provided after the command text, modify with the "argCount" and "argSplit" options.
 * @returns a {Promise} that resolves, optionally with an {Object} containing the sent message and/or database fields to update
 * in relation to the `record`.
 */

/**
 * Represents a single command.
 *
 * @constructor
 * @param {commandFn} fn      the actual function to be executed with this command is called.
 * @param {Object} [options]  parsing directions for discord client receiving the messages.
 * @param {Number} [options.argCount=0]        the number of arguments after command name in the message.
 * @param {string} [options.argSplit=' ']      the character(s) to split the message with.
 * @param {string} [options.description]       a helpful description of the command.
 * @param {boolean} [options.passRecord=false] pass the record of the discord user as the second argument of "fn".
 * @param {string[]} [options.signatures=[]]   possible chat text to initiate this command (use "@BOTNAME" as a placeholder).
 * @param {string} [name]     the method name to use instead of "fn.name".
 */
function Command(fn, options, name) {
	if (!fn.name && !name) throw new Error('No name provided for the command');

	fn.options = Object.assign({
		argCount: 0,
		argSplit: ' ',
		description: 'No description set.',
		passRecord: false,
		signatures: []
	}, options);

	this.name = name || fn.name;
	this.fn = fn;
}

/**
 * Create a default "help" command.
 *
 * @example
 * Commands.add(createHelp());
 * var commands = new Commands();
 * // help is a method of the "commands" instance.
 *
 * @returns {Command} instance suitable for adding to the <Commands> collection.
 */
function createHelp() {
	var options = {
		argCount: 1,
		description: 'List of all known commands or get help for a particular command.',
		signatures: [
			'@BOTNAME help [command]',
			'(in direct message) help [command]'
		]
	};

	return new Command(helpFn, options, 'help');

	function helpFn(msg, helpFor) {
		var lines = [];
		var name = this.client.user.username;
		var command;
		var push = opt => {
			for (var sig of opt.signatures) {
				lines.push('`' + sig.replace('BOTNAME', name) + '` -- ' + opt.description);
			}
		};

		if (helpFor) {
			command = Commands.get(helpFor);

			if (command !== null) {
				push(Commands.prototype[command].options);
			} else if (helpFor === 'help') {
				push(options);
			} else {
				lines.push('Unknown command: ' + helpFor);
			}
		} else {
			for (command of Object.values(Commands.prototype)) {
				push(command.options);
			}

			if (!Commands.has('help')) push(options);
		}

		return Promise.all(lines.map(send => msg.author.send(send))).then(messages => {
			return {sentMsg: messages};
		});
	}
}
