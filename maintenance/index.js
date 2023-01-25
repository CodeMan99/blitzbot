'use strict';

const bb = require('../blitzbot.json');

class Maintenance {
	constructor(master, regions) {
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

	get region() {
		if (this.activeRegion === null) {
			const error = new Error('Set the region first');

			error.code = 'EREGION';

			throw error;
		}

		return this.regions[this.activeRegion];
	}

	set region(region) {
		if (region in this.regions) {
			this.activeRegion = region;
		} else {
			const error = new Error('Invalid region value: ' + region);

			error.code = 'EREGION';

			throw error;
		}
	}

	get client() {
		return this.region.client;
	}

	get db() {
		return this.region.db;
	}

	get wotblitz() {
		return this.region.wotblitz;
	}

	async setupForUser(id) {
		this.discordUser = id;
		const data = await this.master.findOneAsync({_id: id});

		if (data && data.region) {
			this.region = data.region;
		} else {
			this.region = bb.wotblitz.default_region || 'na';
		}

		return this.activeRegion;
	}
}

exports.Maintenance = Maintenance;
