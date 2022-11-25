const util = require('util');
const Datastore = require('nedb');
const loadDatabase = util.promisify(Datastore.prototype.loadDatabase);
const findOne = util.promisify(Datastore.prototype.findOne);
const update = util.promisify(Datastore.prototype.update);

// Unused:
// const ensureIndex = util.promisify(Datastore.prototype.ensureIndex);
// const removeIndex = util.promisify(Datastore.prototype.removeIndex);
// const remove = util.promisify(Datastore.prototype.remove);

// May return a cursor object:
// count, find

module.exports = class extends Datastore {
	loadDatabase() {
		return loadDatabase.call(this);
	}

	findOne(query, projection) {
		const args = [query];

		// optional argument
		if (projection) {
			args.push(projection);
		}

		return findOne.apply(this, args);
	}

	update(query, updateQuery, options) {
		const args = [query, updateQuery];

		// optional argument
		if (options) {
			args.push(options);
		}

		return update.apply(this, args);
	}
};
