const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');

const ObjectId = mongoose.Schema.Types.ObjectId;

const jobsSchema = mongoose.Schema({
    url: { type: String },            // url to crawl
    includeDomains: { type: String }, // including urls
    excludePaths: { type: String },   // excluding paths
    robots: { type: String },         // 0 = ignore all metadata and robots.txt. 1 = check all file types without directories. 2 = check all file types including directories.
    structure: { type: String },      // 0 = default site structure.
    ownerId: { type: ObjectId },      // pass along to response
    email: { type: String }           // pass along to response
});

jobsSchema.plugin(timestamp);

module.exports = mongoose.model('Jobs', jobsSchema);