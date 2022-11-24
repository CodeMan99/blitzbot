'use strict';

const bb = require('../blitzbot.json');

/**
 * @constructor
 */
function Maintenance(master, regions) {
	this.master = master;
	this.regions = regions;
	this.discordUser = null;

	Object.defineProperty(this, 'activeRegion', {
		configurable: true,
		enumerable: false,
		value: null,
		writable: true
	});
}

Object.defineProperty(Maintenance.prototype, 'region', {
	configurable: true,
	enumerable: true,
	get: function() {
		if (this.activeRegion === null) {
			const error = new Error('Set the region first');

			error.code = 'EREGION';

			throw error;
		}

		return this.regions[this.activeRegion];
	},
	set: function(region) {
		if (region in this.regions) {
			this.activeRegion = region;
		} else {
			const error = new Error('Invalid region value: ' + region);

			error.code = 'EREGION';
			this.activeRegion = null;

			throw error;
		}
	}
});

Object.defineProperty(Maintenance.prototype, 'client', {
	configurable: true,
	enumerable: true,
	get: function() {
		return this.region.client;
	}
});

Object.defineProperty(Maintenance.prototype, 'db', {
	configurable: true,
	enumerable: true,
	get: function() {
		return this.region.db;
	}
});

Object.defineProperty(Maintenance.prototype, 'wotblitz', {
	configurable: true,
	enumerable: true,
	get: function() {
		return this.region.wotblitz;
	}
});

Maintenance.prototype.setupForUser = function(id, callback) {
	this.discordUser = id;
	this.master.findOne({_id: id}, (err, data) => {
		if (err) return callback(err);

		try {
			if (data && data.region) {
				this.region = data.region;
			} else {
				this.region = bb.wotblitz.default_region || 'na';
			}

			err = null;
		} catch (e) {
			err = e;
		}

		callback(err, this.activeRegion);
	});
};

exports.Maintenance = Maintenance;
