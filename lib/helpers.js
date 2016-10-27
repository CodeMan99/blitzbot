var Session = require('wotblitz').session.Session;

module.exports = {
	getFieldByPath: getFieldByPath,
	loadSession: loadSession,
	sortBy: sortBy
};

/**
 * Get any value with an object "chain". Never raises an exception.
 *
 * @param {Object} obj structure to get the value from
 * @param {String} path structure keys seperate by "."
 * @returns the value found in the object or null
 * @example
 * // returns "hello"
 * getFieldByPath({
 *   foo: {
 *     bar: 'hello'
 *   }
 * }, 'foo.bar');
 */
function getFieldByPath(obj, path) {
	if (!path) return obj;

	return path.split('.').reduce((section, prop) => {
		if (section instanceof Object && prop in section) {
			return section[prop];
		}

		return null;
	}, obj);
}

/**
 * Create a modified {wotblitz.session.Session}.
 *
 * Necessary because wotblitz is scoped for a single
 * user, and writing a file to disk upon `.save`.
 *
 * @param {Function} saveMethod a custom method to save the session, should accept a "done" callback
 * @param {Object} [state] the initial state of the session, passed to Session constructor
 * @param {Number} [state.account_id] wargaming account_id
 * @param {Object} [state.auth] object created by wargaming's login service (in the querystring)
 * @param {Number} [state.clan_id] the clan which the specified account is a member of
 * @returns {wotblitz.session.Session} that can be used in other wotblitz.js requests
 * @see {@link https://na.wargaming.net/developers/api_reference/wot/auth/login/}
 * @see {@link https://github.com/CodeMan99/wotblitz.js/blob/v0.1.3/lib/session.js#L46}
 */
function loadSession(saveMethod, state) {
	Session.prototype.save = saveMethod;

	state = state || {};

  // wotblitz.js checks for a null value, but undefined will cause errors.
	return new Session(state.account_id || null, state.auth || null, state.clan_id || null);
}

/**
 * A multi-field sorting helper.
 *
 * @see {@link http://stackoverflow.com/a/6913821/2394917}
 */
function sortBy() {
	var fields = Array.prototype.slice.call(arguments);

	return (A, B) => {
		var valueA, valueB, field, key, reverse, result, i;

		for (i = 0; i < fields.length; ++i) {
			result = 0;
			field = fields[i];
			key = typeof field === 'string' ? field : field.name;

			valueA = A[key];
			valueB = B[key];

			if (typeof field.primer === 'function') {
				valueA = field.primer(valueA);
				valueB = field.primer(valueB);
			}

			reverse = (field.reverse) ? -1 : 1;

			if (valueA < valueB) result = reverse * -1;
			if (valueA > valueB) result = reverse * 1;
			if (result !== 0) break;
		}

		return result;
	};
}
