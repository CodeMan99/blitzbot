const {Command} = require('./index.js');
const pkg = require('../../package.json');
const changeLog = require('../../change-log.json');
const changesOptions = {
	argCount: 1,
	description: 'Get the update notes from the author (defaults to the current version).',
	signatures: ['@BOTNAME changes [version]']
};
const changesCmd = new Command(changes, changesOptions, 'changes');
const versionOptions = {
	argCount: 0,
	description: 'Replies the current blitzbot version.',
	signatures: ['@BOTNAME version']
};
const versionCmd = new Command(versionFn, versionOptions, 'version');

module.exports = {
	changes: changesCmd,
	version: versionCmd
};

async function changes(msg, version) {
	version = version || pkg.version;

	if (!(version in changeLog)) return Promise.resolve();

	const lines = [
		'Change Log for `' + pkg.name + '`, version **' + version + '**.'
	].concat(changeLog[version]);
	const sent = await msg.reply(lines.join('\n'));

	return {sentMsg: sent};
}

async function versionFn(msg) {
	const text = `${pkg.name} version ${pkg.version}, written by <@86558039594774528>`;
	const sent = await msg.reply(text);

	return {sentMsg: sent};
}
