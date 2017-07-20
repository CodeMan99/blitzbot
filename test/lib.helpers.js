var test = require('tape');
var helpers = require('../lib/helpers.js');

test('helpers.getFieldByPath', t => {
	var complexObj = {
		name: {
			first: 'Big',
			last: 'Guy'
		},
		location: {
			address: '405 No Where Street',
			city: 'Bigatory',
			state: {
				full: 'Washington',
				abbreviation: 'WA'
			},
			zip: '43981'
		},
		status: {
			age: 10,
			children: 0,
			married: false,
			single: true,
			spouse: null
		}
	};

	t.doesNotThrow(helpers.getFieldByPath, 'does not throw without arguments');
	t.doesNotThrow(() => helpers.getFieldByPath(null, 'foo'), 'does not throw without an object');
	t.doesNotThrow(() => helpers.getFieldByPath(complexObj), 'does not throw without a path');

	t.deepEqual(helpers.getFieldByPath(complexObj), complexObj, 'no path returns the original object');
	t.deepEqual(helpers.getFieldByPath(complexObj, ''), complexObj, 'empty path returns the original object');

	t.equal(helpers.getFieldByPath(complexObj, 'invalid'), null, 'invalid path returns null');
	t.equal(helpers.getFieldByPath(complexObj, 'foo.bar'), null, 'invalid long path returns null');

	t.deepEqual(
		helpers.getFieldByPath(complexObj, 'name'), {first: 'Big', last: 'Guy'}, 'valid path short returns the inner object'
	);
	t.equal(helpers.getFieldByPath(complexObj, 'name.first'), 'Big', 'valid long path returns the string value');
	t.equal(helpers.getFieldByPath(complexObj, 'location.state.full'), 'Washington', 'valid long path returns the string value');

	t.equal(helpers.getFieldByPath(complexObj, 'name.last.toString'), null, 'returns null if path is not an object');
	t.equal(helpers.getFieldByPath(complexObj, 'status.age.toString'), null, 'returns null if path is not an object');
	t.equal(helpers.getFieldByPath(complexObj, 'status.married.toString'), null, 'returns null if path is not an object');
	t.equal(helpers.getFieldByPath(complexObj, 'status.single.toString'), null, 'returns null if path is not an object');

	t.equal(helpers.getFieldByPath(complexObj, 'status.age'), 10, 'able to return a number');
	t.equal(helpers.getFieldByPath(complexObj, 'status.children'), 0, 'able to return a falsy number');
	t.equal(helpers.getFieldByPath(complexObj, 'status.married'), false, 'able to return false');
	t.equal(helpers.getFieldByPath(complexObj, 'status.single'), true, 'able to return true');
	t.equal(helpers.getFieldByPath(complexObj, 'status.spouse'), null, 'able to return null');

	t.end();
});

test('helpers.sortBy', t => {
	var cmp = helpers.sortBy({name: 'index', reverse: true}, {name: 'first', primer: s => s.toLowerCase()}, 'year');
	var a = {index: 0, first: 'Joe', year: 1991};
	var b = {index: 0, first: 'JOE', year: 1991};

	t.equal(typeof cmp, 'function', 'sortBy returns a comparator function');
	t.equal(cmp(a, b), 0, '"first" comparison is case in-sensitive');

	b.year = 1992;
	t.equal(cmp(a, b), -1, '1991 is less than 1992');

	b.index = 1;
	t.equal(cmp(a, b), 1, '0 is less than 1, but reversed');

	a.index = 2;
	t.equal(cmp(a, b), -1, '2 is greater than 1, but reversed');

	b.index = 2;
	b.first = 'brad';
	t.equal(cmp(a, b), 1, '"j" is greater than "b"');

	a.first = 'ANDY';
	t.equal(cmp(a, b), -1, '"a" is less than "b"');

	b.first = 'andy';
	a.year = 1993;
	t.equal(cmp(a, b), 1, '1993 is greater than 1992');

	a = b;
	t.equal(cmp(a, b), 0, 'a copy is the same');

	t.end();
});

test('helpers.messageToString', t => {
	var mts = helpers.messageToString;

	t.equal(mts(), '', 'undefined argument is empty string');
	t.equal(mts(null), '', 'null argument is empty string');
	t.equal(mts('passthrough'), 'passthrough', 'string argument is passed through');
	t.equal(mts(['1', '2']), '1\n2', 'array argument is joined on newline');
	t.equal(mts(Object('string')), 'string', 'object argument is the result of toString');

	t.end();
});
