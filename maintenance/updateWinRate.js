'use strict';

const {Maintenance} = require('.');
const async = require('async');

/**
 * @param {*} value
 * @param {Number} n
 * @returns {Promise<*>} resolves to the input value
 */
function delay(value, n) {
	return new Promise(resolve => setTimeout(resolve, n, value));
}

/**
 * @constructor
 */
function UpdateWinRate(master, regions) {
	Maintenance.call(this, master, regions);
}

UpdateWinRate.super_ = Maintenance;
UpdateWinRate.prototype = Object.create(Maintenance.prototype, {
	constructor: {
		configurable: true,
		enumerable: false,
		value: UpdateWinRate,
		writable: true
	}
});

UpdateWinRate.prototype.updateSingleRecord = function(callback) {
	let db = null;
	let wotblitz = null;

	try {
		db = this.db;
		wotblitz = this.wotblitz;
	} catch (e) {
		return void setImmediate(callback, e);
	}

	db.findOne({_id: this.discordUser}, (err, data) => {
		if (err) return callback(err);

		const result = {
			previous: {
				wins: data.wins,
				battles: data.battles
			}
		};

		wotblitz.account.info(data.account_id, null, null, ['statistics.all.wins', 'statistics.all.battles'])
			.then(info => {
				const wins = info[data.account_id].statistics.all.wins;
				const battles = info[data.account_id].statistics.all.battles;
				const update = {
					wins: wins,
					battles: battles
				};

				db.update({_id: this.discordUser}, {$set: update}, {upsert: true}, error => {
					if (error) return callback(error);

					result.current = update;
					callback(null, result);
				});
			})
			.catch(callback);
	});
};

UpdateWinRate.prototype.updateAll = function(regionName, callback) {
	let db = null;
	let wotblitz = null;

	try {
		this.region = regionName;
		db = this.db;
		wotblitz = this.wotblitz;
	} catch (e) {
		return void setImmediate(callback, e);
	}

	db.find({}, {_id: 1, account_id: 1, wins: 1, battles: 1}, (err, records) => {
		if (err) return callback(err);

		const accountIds = records.map(r => r.account_id);
		const infoRequests = [];
		const fields = ['statistics.all.wins', 'statistics.all.battles'];

		for (let i = 0; i < accountIds.length; i += 100) {
			infoRequests.push(
				// delay every request by 125 milliseconds to avoid rate limiting
				delay(i, i * 1000 / 800)
					.then(index => wotblitz.account.info(accountIds.slice(index, index + 100), null, null, fields))
			);
		}

		Promise.all(infoRequests)
			.then(responses => {
				const info = Object.assign({}, ...responses);
				const updates = [];
				const describe = {
					updatedCount: 0
				};

				for (const record of records) {
					// eslint-disable-next-line eqeqeq
					if (info[record.account_id] != null) {
						const all = info[record.account_id].statistics.all;

						if (record.wins <= record.battles && record.wins <= all.wins && record.battles <= all.battles) {
							describe[record.account_id] = {exists: true, updated: false};
							continue;
						}

						updates.push([
							{_id: record._id},
							{$set: {
								wins: all.wins,
								battles: all.battles
							}}
						]);
						describe[record.account_id] = {exists: true, updated: true};
					} else {
						describe[record.account_id] = {exists: false, updated: false};
					}
				}

				describe.updatedCount = updates.length;

				if (updates.length === 0) {
					return callback(null, describe);
				}

				async.each(updates, (update, cb) => db.update(...update, {upsert: true}, cb), error => {
					if (error) return callback(error);

					callback(null, describe);
				});
			})
			.catch(callback);
	});
};

exports.UpdateWinRate = UpdateWinRate;
