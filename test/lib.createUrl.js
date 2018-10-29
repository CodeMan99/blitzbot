const test = require('tape');
const qs = require('querystring');
const mockery = require('mockery');

mockery.registerAllowable('querystring');
mockery.registerAllowable('../lib/createUrl.js');
mockery.registerMock('../blitzbot.json', {
	app: {
		client_id: 'fakeclientid'
	}
});
mockery.enable();

const createUrl = require('../lib/createUrl.js');

mockery.disable();
mockery.deregisterAll();

// the permissions is the only thing that varies in createUrl at the moment
function parse(url) {
	const right = url.split('?')[1];

	return qs.parse(right).permissions;
}

test('createUrl', t => {
	t.equal(parse(createUrl(5)), '5', 'single number argument');
	t.equal(parse(createUrl(1, 2)), '3', 'multiple number arguments');
	t.equal(parse(createUrl([2, 4])), '6', 'single array argument');
	t.ok(parse(createUrl()), 'no arguments, return default value');
	t.end();
});
