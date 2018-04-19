const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');

const ObjectId = mongoose.Schema.Types.ObjectId;

const scheduledJobs = mongoose.Schema({
    // 0 = standard, 1 = advanced
    typeOfSetting: { type: Number },
    // advanced settings-string
    advancedSetting: { type: String },
    // 0 = ignore all metadata and robots.txt.
    // 1 = check all file types without directories.
    // 2 = check all file types including directories.
    robots: { type: Number, min: 0, max: 2 },
    // 0 = default site structure.
    structure: { type: Number, min: 0, max: 5 },
    // 0 = none
    // 1 = daily
    // 2 = weekly
    // 3 = monthly
    typeOfSchedule: { type: Number, min: 0, max: 3 },

    url: { type: String },
    includeDomains: { type: String },
    excludePaths: { type: String },
    ownerId: { type: ObjectId },
    email: { type: String }
});

scheduledJobs.plugin(timestamp);

module.exports = mongoose.model('ScheduleJobs', scheduledJobs);