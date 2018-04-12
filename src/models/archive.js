const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const prettyFileSize = require('prettysize');

const ObjectId = mongoose.Schema.Types.ObjectId;

const archiveSchema = mongoose.Schema({
    fileName: { type: String, unique: true },
    owner: { type: ObjectId },
    fileSize: { type: String }
});

archiveSchema.plugin(timestamp);

archiveSchema.post('init', function (doc) {
    doc.fileSize = prettyFileSize(doc.fileSize);
});

module.exports = mongoose.model('Archive', archiveSchema);