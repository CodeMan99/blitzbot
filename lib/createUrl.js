const auth = require('../blitzbot.json');
const qs = require('querystring');

module.exports = createApplicationUrl;

/**
 * Create application authentication URL.
 * Allows a member with the "Manage Server" permission to add the application.
 *
 * @param {...number} [permissions=0x231cc00] discord defined permission flags as a number, number array, or arguments
 * @returns {String} application authorize URL
 * @see {@link https://discordapp.com/developers/docs/topics/permissions#bitwise-permission-flags|Discord permission flags}
 */
function createApplicationUrl(permissions) {
	const discordAuthorizeURL = 'https://discordapp.com/oauth2/authorize?';
	const query = {
		client_id: auth.app.client_id,
		scope: 'bot',
		permissions: 0
	};

	let pArr;

	if (arguments.length > 1) {
		pArr = Array.from(arguments);
	} else if (Array.isArray(permissions)) {
		pArr = permissions;
	}

	if (pArr) {
		query.permissions = pArr.reduce((a, b) => a | b);
	} else if (!isNaN(permissions)) {
		query.permissions = permissions;
	} else {
		// default
		query.permissions = 0x0000400 | 0x0000800 | 0x0004000 | 0x0008000 | 0x0010000 | 0x0100000 | 0x0200000 | 0x2000000;
	}

	return discordAuthorizeURL + qs.stringify(query);
}
