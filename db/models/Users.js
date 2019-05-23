const mongoose = require('mongoose');
const connection = require('../connection');
const Schema = mongoose.Schema;

/* User Schema */
const UserSchema = new Schema({
    username: String,
    photo: String,
    token: Array
})

const User = mongoose.model('User', UserSchema);

module.exports = User;