module.exports = {
  'Commands': Commands,
  'Command': Command,
  'createHelp': createHelp,
};

/**
 * Collection class of <Command>.
 *
 * @example
 * // Test for existance of a <Command>
 * if ('command' in Commands.prototype) {
 *   // call the command, being careful to preverse the instance
 *   commands['command'].call(commands, msg, record);
 * }
 *
 * @param {discord.Client} discordClient a discord.js instance; Note no check is performed to ensure initialization is complete
 * @param {Datastore} nedbConnection     a nedb instacnce; Note no check is performed to ensure initialization is complete
 */
function Commands(discordClient, nedbConnection) {
  this.client = discordClient;
  this.db = nedbConnection;
}

/**
 * Add a <Command> into the Commands collections.
 *
 * @example
 * // add the "fn" of the given command to Commands.prototype
 * Commands.addCommand(new Command());
 *
 * @param {Command} command an instance, must have "name" and "fn" properties
 */
Commands.addCommand = function addCommand(command) {
  Commands.prototype[command.name] = command.fn;
};

/**
 * Existance of a command in the collection.
 * Named "$has" to allow "has" to be a command name.
 *
 * @param {string} cmdName the command name to look for.
 * @returns {boolean} true when the command exists.
 */
Commands.prototype.$has = function hasCommand(cmdName) {
  return (cmdName in Commands.prototype);
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
 * Represent a single command.
 *
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
  if (fn && !fn.name && !name) throw new Error('No name provided for the command');

  options = options || {};
  fn.options = {
    argCount: options.argCount || 0,
    argSplit: typeof options.argSplit !== 'undefined' ? options.argSplit : ' ',
    description: options.description || 'No description set.',
    passRecord: options.passRecord || false,
    signatures: options.signatures || [],
  };

  this.name = name || fn.name;
  this.fn = fn;
}

/**
 * Create a default "help" command.
 *
 * @example
 * Commands.addCommand(createHelp());
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
      '(in direct message) help [command]',
    ],
  };

  return new Command(helpFn, options, 'help');

  function helpFn(msg, helpFor) {
    var lines = [];
    var name = this.client.user.username;
    var push = (opt) => {
      opt.signatures.forEach(sig => lines.push('`' + sig.replace('BOTNAME', name) + '` -- ' + opt.description));
    };

    if (helpFor) {
      if (helpFor in Commands.prototype) {
        push(Commands.prototype[helpFor].options);
      } else if (helpFor === 'help') {
        push(options);
      } else {
        lines.push('Unknown command: ' + helpFor);
      }
    } else {
      Object.keys(Commands.prototype).forEach(key => {
        if (key === '$has') return;

        push(Commands.prototype[key].options);
      });

      if (!('help' in Commands.prototype)) push(options);
    }

    return Promise.all(lines.map(send => this.client.sendMessage(msg.author, send))).then(messages => {
      return {sentMsg: messages};
    });
  }
}
