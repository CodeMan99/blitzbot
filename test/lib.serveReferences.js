const test = require('tape');
const mockery = require('mockery');
const inspectHandle = {};

process.title = 'testbot';

class SocketMock {
	constructor() {
		this.bytesRead = 0;
		this.bytesWritten = 0;
	}

	write(s) {
		this.bytesWritten += s.length;
	}

	read(buf) {
		this.bytesRead += buf.length;
	}

	unref() { }
}

mockery.registerAllowable('../lib/serveReferences.js');
mockery.registerMock('net', {
	createServer: listener => {
		const server = {};
		const prototype = Object.getPrototypeOf(server);

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
		const server = {
			context: {},
			prompt: options.prompt,
			useColors: options.useColors,
			ignoreUndefined: options.ignoreUndefined,
			input: options.input,
			output: options.output
		};
		const prototype = Object.getPrototypeOf(server);

		prototype.on = function(name, handle) {}; // eslint-disable-line no-unused-vars

		inspectHandle.repl = server;

		return server;
	}
});
mockery.enable();

const serveReferences = require('../lib/serveReferences.js');

mockery.disable();
mockery.deregisterAll();

test('serveReferences', t => {
	const refs = {
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
