const mongoose = require('mongoose');
const connection = require('../connection');
const Schema = mongoose.Schema;

/* User Schema */
const UserSchema = new Schema({
    username: String,
    photo: String
})

const User = mongoose.model('User', UserSchema);

module.exports = User;