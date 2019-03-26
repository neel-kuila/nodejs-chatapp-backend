const express = require('express');
const router = express.Router();
const Chat = require('../db/models/Chats');
const User = require('../db/models/Users');

//Add new chats to "chats" collection
router.post('/addchat', (req,res) => {
    let from = req.query.from;
    let to = req.query.to;
    Chat.findOne({
        $or: [
            { $and: [{userOne: from}, {userTwo: to}] }, 
            { $and: [{userOne: to, userTwo: from}] }
        ]
    })
    .then(docs => {
        console.log(docs);
        if(!docs) {
            new Chat({ 
                userOne: from,
                userTwo: to,
                chat: [{
                    from: from,
                    to: to,
                    message: req.query.message
                }]
            }).save().then(newUserChat=> {
                console.log('new user chat', newUserChat);
                res.send('new user chat');
            })
        }
        else {
            Chat.update({
                $or: [
                    { $and: [{userOne: from}, {userTwo: to}] }, 
                    { $and: [{userOne: to, userTwo: from}] }
                ]
            },
            { $push: { chat: req.query }}
            )
            .then(chat => {
                console.log('chat added',chat);
                res.send('new chat');
            })
        }
    })
})

//Get chats
router.get('/getchats', (req,res) => {
    console.log(req.query)
    let from = req.query.from;
    let to = req.query.to;
    if(from && to) {
        Chat.findOne({
            $or: [
                { $and: [{userOne: from}, {userTwo: to}] }, 
                { $and: [{userOne: to, userTwo: from}] }
            ]
        }).then(result => {
            if(result) {
                res.send({ chats: result.chat });
            }
        }).catch(err => {
            console.log('error',err)
        })
    }
    else {
        res.send({ chats: [] });
    }
})

//Get user photo
router.get('/getPhoto', (req,res) => {
    User.findOne({ username: req.query.username.replace(/-/g,' ') }).then(result => {
        res.send({ url: result.photo });
    })
})

//Get chats with all users
router.get('/getAllUsersChats', (req,res) => {
    Chat.find({
        $or: [
            { userOne: req.body.user },
            { userTwo: req.body.user }
        ]
    }).then(result => {
        res.json({allUsersChat: result });
    }).catch(err => {
        console.log('error',err);
    })
})

module.exports = router;