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
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/chat', chatRouter);

var socketIO = require('socket.io');
const server = app.listen(PORT,() => console.log('server started on port',PORT));
var io = socketIO(server);
io.origins('*:*')

var connectedUsers = {};
io.on('connection', socket => {
  console.log('a user connected',socket.id);
  socket.on('register',username => {
    if(username) {
      connectedUsers[username]=socket.id;
      io.sockets.emit('onlineusers', connectedUsers);
    }
  })

  socket.on('private', (data) => {
    console.log(data);
    io.sockets.emit(data.from,data);
    io.sockets.emit(data.to,data);
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
    Object.keys(connectedUsers).map(user => {
      if(connectedUsers[user]===socket.id) {
        delete connectedUsers[user];
        io.sockets.emit('onlineusers', connectedUsers);
      }
    })
  })
})