require("dotenv").config();
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());
var indexRouter = require('./routes/index');
var chatRouter = require('./routes/chat');
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/chat', chatRouter);

const server = app.listen(PORT,() => console.log('server started on port',PORT));

var socketIO = require('socket.io');
var io = socketIO(server);
io.origins('*:*')

//Object of online users 
var connectedUsers = {};

//Listens for socket connection
io.on('connection', socket => {
  console.log('a user connected',socket.id);

  //Adds the user to the list of online users
  socket.on('register',username => {
    if(username) {
      connectedUsers[username]=socket.id;
      io.sockets.emit('onlineusers', connectedUsers);
    }
  })

  //Private Chat Listener
  socket.on('private', (data) => {
    console.log(data);
    //Emit message to itself and user
    io.sockets.emit(data.from,data);
    io.sockets.emit(data.to,data);
  })

  //Listens for socket disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected');

    //Delete the user from the list of online users
    Object.keys(connectedUsers).map(user => {
      if(connectedUsers[user]===socket.id) {
        delete connectedUsers[user];
        //Notify other users who all are online
        io.sockets.emit('onlineusers', connectedUsers);
      }
    })
  })
})