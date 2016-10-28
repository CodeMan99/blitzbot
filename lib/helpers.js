module.exports = {
	getFieldByPath: getFieldByPath,
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
