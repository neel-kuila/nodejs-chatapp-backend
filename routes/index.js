var express = require('express');
var router = express.Router();
const User = require('../db/models/Users');

//Adds new user to "users" collection
router.post('/adduser', function(req, res, next) {
  User.findOne({username: req.query.username})
  .then(currentUser => {
    if(currentUser) {
      console.log('current user');
      res.json({response:'already a user'});
    }
    else {
      new User(req.query).save().then(newUser => {
        console.log('new user',newUser);
        res.json({response:'new user added'});
      });
    }
  })
});

//Get all users
router.get('/getusers', (req,res) => {
  User.find({})
  .then(response => {
    res.send({ users: response });
  })
})

module.exports = router;
