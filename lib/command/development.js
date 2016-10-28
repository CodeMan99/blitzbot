var Command = require('./index.js').Command;
var pkg = require('../../package.json');
var changesOptions = {
	argCount: 1,
	description: 'Get the update notes from the author (defaults to the current version).',
	signatures: ['@BOTNAME changes [version]']
};
var changesCmd = new Command(changes, changesOptions, 'changes');
var versionOptions = {
	argCount: 0,
	description: 'Replies the current blitzbot version.',
	signatures: ['@BOTNAME version']
};
var versionCmd = new Command(versionFn, versionOptions, 'version');

module.exports = {
	changes: changesCmd,
	version: versionCmd
};

function changes(msg, version) {
	version = version || pkg.version;

	if (!(version in pkg.changeLog)) return Promise.resolve();

	var lines = [
		'Change Log for `' + pkg.name + '`, version **' + version + '**.'
	].concat(pkg.changeLog[version]);

	return msg.reply(lines.join('\n')).then(sent => {
		return {sentMsg: sent};
	});
}

function versionFn(msg) {
	var text = `${pkg.name} version ${pkg.version}, written by <@86558039594774528>`;

	return msg.reply(text).then(sent => {
		return {sentMsg: sent};
	});
}
