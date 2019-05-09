const express = require('express');
const router = express.Router();
const Chat = require('../db/models/Chats');
const User = require('../db/models/Users');

const oneToOneChatAuthCheck = (req,res,next) => {
    if(req.query.token) {
        User.findOne({
            $or: [
                { $and: [{username: req.query.from}, {token: req.query.token}] },
                { $and: [{username: req.query.to}, {token: req.query.token}] }
            ]
        }).then(doc => {
            if(doc) {
                next();
            }
            else {
                res.send('not authorised');
            }
        })
    }
    else {
        res.send('not authorised');
    }
}

const allUsersAuthCheck = (req,res,next) => {
    if(req.query.token) {
        User.findOne({ username: req.query.user, token:req.query.token })
        .then(doc => {
            doc?next():res.send('not authorised')
        })
    }
    else {
        res.send('not authorised');
    }
}

//Add new chats to "chats" collection
router.post('/addchat', oneToOneChatAuthCheck, (req,res) => {
    let from = req.query.from;
    let to = req.query.to;
    Chat.findOne({
        $or: [
            { $and: [{userOne: from}, {userTwo: to}] }, 
            { $and: [{userOne: to, userTwo: from}] }
        ]
    })
    .then(docs => {
        req.query.date=new Date();
        if(!docs) {
            new Chat({ 
                userOne: from,
                userTwo: to,
                chat: [{
                    from: from,
                    to: to,
                    message: req.query.message,
                    date: req.query.date
                }]
            }).save().then(newUserChat=> {
                console.log('new user chat', newUserChat);
                res.send({message: 'message received', date: req.query.date} );
            })
        }
        else {
            Chat.updateOne({
                $or: [
                    { $and: [{userOne: from}, {userTwo: to}] }, 
                    { $and: [{userOne: to, userTwo: from}] }
                ]
            },
            {
                $push: {
                    chat: req.query
                }
            }
            )
            .then(chat => {
                //console.log('chat added',chat);
                res.send({message: 'message received', date: req.query.date} );
            })
        }
    }).catch(err => {
        console.log(err);
    })
})

//Get chats
router.get('/getchats', oneToOneChatAuthCheck, (req,res) => {
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
router.get('/getAllUsersChats', allUsersAuthCheck, (req,res) => {
    let user = req.query.user.replace(/-/g,' ');
    Chat.find({
        $or: [
            { userOne: user },
            { userTwo: user }
        ]
    }).then(result => {
        res.json({allUsersChat: result });
    }).catch(err => {
        console.log('error',err);
    })
})

module.exports = router;