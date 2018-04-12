const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const ObjectId = mongoose.Schema.Types.ObjectId;

const archiveSchema = mongoose.Schema({
    fileName: { type: String, unique: true },
    owner: { type: ObjectId },
    fileSize: { type: String }
});

archiveSchema.plugin(timestamp);

module.exports = mongoose.model('Archive', archiveSchema);