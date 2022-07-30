const http = require('http');
const express = require('express');
const socketio = require('socket.io');
let cors= require("cors");

const { addUser,removeUser,getUser,getUserInRoom} = require('./users.js');
const router = require('./router');
const { Socket } = require('dgram');
const { text } = require('express');
const port =process.env.PORT;
const app = express();
const server = http.createServer(app);
const io = socketio(server);
// app.use(cors());
io.on('connect',(socket) =>{
  // console.log("user has connected");
  // socket.on('join',({name,room},callback) =>{
  //   console.log(name,room);
  // })
  socket.on('join', ({name,room}, callback) =>{
    //console.log("user has joined");
   // console.log(name,room);
   const{error,user} = addUser({id:socket.id, name, room});
   if(error) return callback (error);
   socket.emit('message',{user: 'admin' ,text: `${user.name}, welcome to the room ${user.room}`});
   socket.broadcast.to(user.room).emit('message',{user: 'admin',text : `${user.name} has joined`});
   socket.join(user.room);
   //io.to(user.room).emit('roomData',{room:user.room , users: getUserInRoom(user.room)});
   callback(); 
  }); 
  socket.on('sendMessage',(message,callback)  => {
     const user = getUser(socket.id);
     io.to(user.room).emit('message',{user: user.name , text: message});
     //io.to(user.room).emit('roomData',{room: user.room , users: getUserInRoom(user.room)});
     callback();

  });  
  socket.on('disconnect', () =>{
   // console.log('user is disconnected');
    const user = removeUser(socket.id);
    if(user){
      io.to(user.room).emit('message',{user : 'admin', text: `${user.name} has left`})
    }
  }

  )
})
 app.use(cors());

app.use(router);
server.listen(port, () => console.log(`Server has started.`));