const { URL } = require('url');
const validUrl = require('valid-url');
const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongoosePaginate = require('mongoose-paginate');
const Schedule = require('./enums').schedule;
const Setting = require('../models/enums').setting;

const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = mongoose.Schema({
    // 0 = standard, 1 = advanced
    typeOfSetting: {
        type: Number
    },
    // advanced settings-string
    advancedSetting: {
        type: String
    },
    // 0 = ignore all metadata and robots.txt.
    // 1 = check all file types without directories.
    // 2 = check all file types including directories.
    robots: {
        type: Number,
        min: 0,
        max: 2
    },
    // 0 = default site structure.
    structure: {
        type: Number,
        min: 0,
        max: 5
    },
    // 0 = none
    // 1 = daily
    // 2 = weekly
    // 3 = monthly
    typeOfSchedule: {
        type: Number,
        min: 0,
        max: 3
    },

    url: {
        type: String
    },
    includeDomains: {
        type: String
    },
    excludePaths: {
        type: String
    },
    ownerId: {
        type: ObjectId
    },
    shouldNotify: {
        type: Boolean,
        default: true
    },
    email: {
        type: String
    },
    isPaused: {
        type: Boolean,
        default: false
    },
});

schema.plugin(timestamp);
schema.plugin(mongoosePaginate);

schema.post('init', (doc) => {
    if (doc.typeOfSchedule === Schedule.NONE) doc.scheduleName = 'Ingen';
    if (doc.typeOfSchedule === Schedule.DAILY) doc.scheduleName = 'Dagligen';
    if (doc.typeOfSchedule === Schedule.WEEKLY) doc.scheduleName = 'Veckovis';
    if (doc.typeOfSchedule === Schedule.MONTHLY) doc.scheduleName = 'Månadsvis';

    if (doc.typeOfSetting === Setting.ADVANCED) {
        doc.url = doc.advancedSetting.split(' ')[0];
    }

    makeUserFriendlyUrl(doc);
});

/**
 * Makes the url user friendly for viewing (removes "http://" etc)
 * @param {*} doc Schedule
 */
function makeUserFriendlyUrl(doc) {
    doc.friendlyUrl = (validUrl.isUri(doc.url) ? new URL(doc.url).hostname : doc.url);

    if (doc.includeDomains) {
        let subUrls = doc.includeDomains.split(',');
        for (let j = 0; j < subUrls.length; j++) {
            subUrls[j] = (validUrl.isUri(subUrls[j]) ? new URL(subUrls[j]).hostname : subUrls[j]);
        }
        doc.friendlyIncludeDomains = subUrls.join(' ');
    }
}
module.exports = mongoose.model('Schedules', schema);