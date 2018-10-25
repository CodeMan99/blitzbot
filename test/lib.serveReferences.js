var test = require('tape');
var mockery = require('mockery');
var inspectHandle = {};

process.title = 'testbot';

function SocketMock() {
	this.bytesRead = 0;
	this.bytesWritten = 0;
}

SocketMock.prototype.write = function(s) {
	this.bytesWritten += s.length;
};

SocketMock.prototype.read = function(buf) {
	this.bytesRead += buf.length;
};

SocketMock.prototype.unref = function() {};

mockery.registerAllowable('../lib/serveReferences.js');
mockery.registerMock('net', {
	createServer: listener => {
		var server = {};
		var prototype = Object.getPrototypeOf(server);

		prototype.close = function() {};

		prototype.listen = function(options, callback) {
			server.address = {
				port: options.port,
				address: options.host,
				family: 'IPv4'
			};

			setImmediate(callback);
		};

		prototype.once = function(name, handle) {}; // eslint-disable-line no-unused-vars

		prototype.unref = function() {};

		setImmediate(() => listener(new SocketMock()));

		return server;
	}
});
mockery.registerMock('repl', {
	start: options => {
		var server = {
			context: {},
			prompt: options.prompt,
			useColors: options.useColors,
			ignoreUndefined: options.ignoreUndefined,
			input: options.input,
			output: options.output
		};
		var prototype = Object.getPrototypeOf(server);

		prototype.on = function(name, handle) {}; // eslint-disable-line no-unused-vars

		inspectHandle.repl = server;

		return server;
	}
});
mockery.enable();

var serveReferences = require('../lib/serveReferences.js');

mockery.disable();
mockery.deregisterAll();

test('serveReferences', t => {
	var refs = {
		foo: 'bar',
		baz: 1,
		hello: () => console.log('Hello!'),
		square: x => x * x
	};

	serveReferences(refs, (err, server) => {
		t.error(err, 'does not normally error');

		if (err) return t.end();

		t.equal(server.address.port, 8008, 'defaults to port 8008');

		t.equal(inspectHandle.repl.prompt, 'testbot> ', 'repl prompt uses process title');
		t.equal(inspectHandle.repl.useColors, true, 'repl uses colors');
		t.equal(inspectHandle.repl.ignoreUndefined, true, 'repl ignores undefined');
		t.ok(inspectHandle.repl.output instanceof SocketMock, 'repl output handle is a socket');
		t.ok(inspectHandle.repl.input instanceof SocketMock, 'repl input handle is a socket');

		t.equal(inspectHandle.repl.context.foo, 'bar', 'set foo reference in the context');
		t.equal(inspectHandle.repl.context.baz, 1, 'set baz reference in the context');
		t.equal(typeof inspectHandle.repl.context.hello, 'function', 'set hello reference in the context');
		t.equal(typeof inspectHandle.repl.context.square, 'function', 'set square reference in the context');

		t.end();
	});
});
