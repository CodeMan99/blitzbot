module.exports = {
  getFieldByPath: getFieldByPath
};

/**
 * Get any value with an object "chain". Never raises an exception.
 *
 * @example
 * // returns "hello"
 * getFieldByPath({
 *   foo: {
 *     bar: 'hello'
 *   }
 * }, 'foo.bar');
 *
 * @param {Object} obj structure to get the value from
 * @param {String} path structure keys seperate by "."
 * @return the value found in the object or null
 */
function getFieldByPath(obj, path) {
  if (!path) return obj;

  return path.split('.').reduce(function(section, prop) {
    if (section instanceof Object && prop in section) {
      return section[prop];
    }

    return null;
  }, obj);
}
