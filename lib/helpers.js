module.exports = {
	getFieldByPath: getFieldByPath,
	messageToString: messageToString,
	log: log,
	error: error,
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
 * A multi-field sorting helper.
 *
 * @see {@link http://stackoverflow.com/a/6913821/2394917}
 */
function sortBy(...fields) {
	return (A, B) => {
		let valueA, valueB, field, key, reverse, i, result = 0;

		for (i = 0; i < fields.length; ++i) {
			field = fields[i];
			key = typeof field === 'string' ? field : field.name;
			reverse = field.reverse ? -1 : 1;

			valueA = A[key];
			valueB = B[key];

			if (typeof field.primer === 'function') {
				valueA = field.primer(valueA);
				valueB = field.primer(valueB);
			} else if (field.primer) {
				throw new TypeError('sortBy: primer must be a function or undefined');
			}

			if (typeof valueA === 'string' && typeof valueB === 'string') {
				result = valueA.localeCompare(valueB) * reverse;
			} else if (valueA < valueB) {
				result = reverse * -1;
			} else if (valueA > valueB) {
				result = reverse * 1;
			}

			if (result !== 0) break;
		}

		return result;
	};
}

/**
 * Given any message, convert it to a string.
 *
 * @param {*} message a sent or received message of any type
 * @returns {string} form of the message
 */
function messageToString(message) {
	if (!message) {
		return '';
	} else if (Array.isArray(message)) {
		return message.join('\n');
	}

	return message.toString();
}


/**
 * Logs a message to the console log with a timestamp prepended to it
 *
 * @param {*} message A message of any type
 */
function log(message) {
	console.log(new Date().toLocaleString() + ' ' + messageToString(message));
}



/**
 * Logs a message to the console error log with a timestamp prepended to it
 *
 * @param {*} message A message of any type
 */
function error(message) {
	console.error(new Date().toLocaleString() + ' ' + messageToString(message));
}



