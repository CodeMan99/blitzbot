'use strict';

const {Maintenance} = require('.');

/**
 * @param {*} value
 * @param {Number} n
 * @returns {Promise<*>} resolves to the input value
 */
function delay(value, n) {
	return new Promise(resolve => setTimeout(resolve, n, value));
}

class UpdateWinRate extends Maintenance {
	async updateSingleRecord() {
		const db = this.db;
		const wotblitz = this.wotblitz;
		const data = await db.findOneAsync({_id: this.discordUser});
		const result = {
			previous: {
				wins: data.wins,
				battles: data.battles
			}
		};
		const info = await wotblitz.account.info(data.account_id, null, null, ['statistics.all.wins', 'statistics.all.battles']);
		const {wins, battles} = info[data.account_id].statistics.all;
		const update = {wins, battles};

		await db.updateAsync({_id: this.discordUser}, {$set: update}, {upsert: true});

		result.current = update;

		return result;
	}

	async updateAll(regionName) {
		this.region = regionName;

		const db = this.db;
		const wotblitz = this.wotblitz;
		const records = await db.findAsync({}, {_id: 1, account_id: 1, wins: 1, battles: 1});
		const accountIds = records.map(r => r.account_id);
		const infoRequests = [];

		for (let i = 0; i < accountIds.length; i += 100) {
			// delay every request by 125 milliseconds to avoid rate limiting
			infoRequests.push(
				delay(i, i * 1000 / 800)
					.then(index => getInfoChunk(accountIds, wotblitz, index))
			);
		}

		const infoResponses = await Promise.all(infoRequests);
		const info = Object.assign({}, ...infoResponses);
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

				const update = db.updateAsync({_id: record._id}, {
					$set: {
						wins: all.wins,
						battles: all.battles
					}
				}, {upsert: true});

				updates.push(update);
				describe[record.account_id] = {exists: true, updated: true};
			} else {
				describe[record.account_id] = {exists: false, updated: false};
			}
		}

		describe.updatedCount = updates.length;

		await Promise.all(updates);

		return describe;
	}
}

async function getInfoChunk(accountIds, wotblitz, i) {
	const accountIdsChunk = accountIds.slice(i, i + 100);
	const fields = ['statistics.all.wins', 'statistics.all.battles'];
	const infoChunk = await wotblitz.account.info(accountIdsChunk, null, null, fields);

	return infoChunk;
}

exports.UpdateWinRate = UpdateWinRate;
