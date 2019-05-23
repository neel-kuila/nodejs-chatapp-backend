var express = require('express');
var router = express.Router();
const User = require('../db/models/Users');

const deleteTokenAuth = (req,res,next) => {
  console.log(req.body);
  if(req.body.token) {
    User.findOne({ username: req.body.username, token: [req.body.token] })
    .then(doc => {
      doc?next():res.send('not authorised');
    })
  } 
  else {
    res.send('not authorised');
  }
}

//Adds new user to "users" collection
router.post('/adduser', function(req, res) {
  User.findOne({username: req.query.username})
  .then(currentUser => {
    if(currentUser) {
      User.updateOne({ username: req.query.username }, { 
        $push: { token: req.query.token } 
      })
      .then(response => {
        console.log(response);
        console.log('current user');
        res.json({response:'already a user'});
      })
    }
    else {
      let user = {
        username: req.query.username,
        photo: req.query.photo,
        token: [req.query.token]
      }
      new User(user).save().then(newUser => {
        console.log('new user',newUser);
        res.json({response:'new user added'});
      });
    }
  })
});

//Get all users
router.get('/getusers', (req,res) => {
  User.find({}, { username: 1, photo: 1}).collation({ locale: 'en'}).sort({ username: 1 })
  .then(response => {
    res.send({ users: response });
  })
})

router.post('/deleteToken', deleteTokenAuth,(req,res) => {
  User.updateOne({ username: req.body.username }, { $pull: { token: req.body.token }})
  .then(response => {
    res.send('token deleted');
  })
});

module.exports = router;
