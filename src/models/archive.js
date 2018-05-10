const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const prettyFileSize = require('prettysize');
const mongoosePaginate = require('mongoose-paginate');
const dayjs = require('dayjs');

const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = mongoose.Schema({
    fileName: { type: String, unique: true },
    ownerId: { type: ObjectId },
    fileSize: { type: String },
    fromSchedule: { type: ObjectId }
});

schema.plugin(timestamp);
schema.plugin(mongoosePaginate);

// After finding documents, run this function on each document.
schema.post('init', (doc) => {
    doc.fileSize = prettyFileSize(doc.fileSize);
    doc.downloadPath = '/archives/' + doc._id;
    doc.date = dayjs(doc.createdAt).format('YY-MM-DD HH:mm');
    doc.prettyName = doc.fileName.substring(0, doc.fileName.indexOf('_'));
});

module.exports = mongoose.model('Archive', schema);