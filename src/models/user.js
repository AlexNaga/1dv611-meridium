const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

userSchema.plugin(timestamp);

module.exports = mongoose.model('User', userSchema);