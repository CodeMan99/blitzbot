const net = require('net');
const repl = require('repl');

module.exports = serveReferences;

/**
 * Serve an Object reference in a REPL via a socket.
 *
 * @param {Object} context keys use as the reference name
 * @param {Number} [port=8008] open the socket on this port
 * @param {Function} callback
 */
function serveReferences(context, port, callback) {
	if (typeof port === 'function') {
		callback = port;
		port = 8008;
	}

	const server = net.createServer(socket => {
		const r = repl.start({
			prompt: process.title + '> ',
			input: socket,
			output: socket,
			useColors: true,
			ignoreUndefined: true
		});

		r.context = Object.assign(r.context, context);
		r.on('exit', () => socket.end());

		socket.unref();
	});

	server.once('error', error => {
		server.close();

		callback(error);
	});

	server.listen({
		host: 'localhost',
		port: port,
		exclusive: true
	}, () => {
		server.unref();

		callback(null, server);
	});
}
