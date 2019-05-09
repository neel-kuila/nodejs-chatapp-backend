const mongoose = require('mongoose');
const connection = require('../connection');
const Schema = mongoose.Schema;

/* Chat Schema */
const chatSchema = new Schema({
    userOne: {
        type: String
    },
    userTwo: {
        type: String
    },
    chat: [
        {
            from: String,
            to: String,
            message: String,
            date: Date
        }
    ]
});

const Chat = mongoose.model('chat', chatSchema);
module.exports =  Chat;