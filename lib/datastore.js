const util = require('util');
const Datastore = require('nedb');

module.exports = class extends Datastore {
    loadDatabase = util.promisify(Datastore.prototype.loadDatabase);
    findOne = util.promisify(Datastore.prototype.findOne);
    update = util.promisify(Datastore.prototype.update);

    // Unused:
    // ensureIndex = util.promisify(Datastore.prototype.ensureIndex);
    // removeIndex = util.promisify(Datastore.prototype.removeIndex);
    // remove = util.promisify(Datastore.prototype.remove);

    // May return a cursor object:
    // count, find
};
