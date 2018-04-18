const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');

const ObjectId = mongoose.Schema.Types.ObjectId;

const scheduledJobs = mongoose.Schema({
    typeOfSetting: { type: Number },  // 0 = standard, 1 = advanced
    advancedSeting: { type: String }, // advanced string setting
    url: { type: String },            // url to crawl
    includeDomains: { type: String }, // including urls
    excludePaths: { type: String },   // excluding paths
    robots: { type: Number },         // 0 = ignore all metadata and robots.txt. 1 = check all file types without directories. 2 = check all file types including directories.
    structure: { type: Number },      // 0 = default site structure.
    ownerId: { type: ObjectId },      // pass along to response
    email: { type: String },          // pass along to response
    typeOfShedule: { type: Number }       // 0 = none, 1 = daily, 2 = weekly, 3 = monthly
});

scheduledJobs.plugin(timestamp);

module.exports = mongoose.model('ScheduleJobs', scheduledJobs);