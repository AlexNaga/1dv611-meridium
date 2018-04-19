const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const prettyFileSize = require('prettysize');

const ObjectId = mongoose.Schema.Types.ObjectId;

const archiveSchema = mongoose.Schema({
    fileName: { type: String, unique: true },
    ownerId: { type: ObjectId },
    fileSize: { type: String },
    fromSchedule:{ type: ObjectId }
});

archiveSchema.plugin(timestamp);

// After finding documents, run this function on each document.
archiveSchema.post('init', (doc) => {
    doc.fileSize = prettyFileSize(doc.fileSize);
});

module.exports = mongoose.model('Archive', archiveSchema);