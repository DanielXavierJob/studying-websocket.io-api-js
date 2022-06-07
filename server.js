class User {
  constructor(param){
    this.id = param.id;
    this.socket_id = param.socket_id;
    this.restaurant_id = param.restaurant_id;
  }
  setType(array){
    switch(array.type){
      case "id":
        this.id = array.key;
        break;
      case "socket_id":
        this.socket_id = array.key;
        break;
      case "restaurant_id":
        this.restaurant_id = array.key;
        break;
    }
  }
}


var express = require("express");
var app = express();
var axios = require("axios");
var http = require("http").createServer(app);
var socketIO = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

var users = [];
setInterval(() => {
  console.log(socketIO.allSockets())
  users.forEach((args) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    axios
      .post("https://127.0.0.1/public/api/gestor/newsOrders", {
        auth_token: args.auth_token,
        restaurant_id: args.restaurant_id,
      })
      .then((resp) => {
        socketIO.to(args.socket).emit("messageReceived", resp.data);
      })
      .catch((resp) => {
        console.log(resp);
      });
  });
}, 5000);
const GetPrimaryData = (args) => {
  axios
  .post("https://127.0.0.1/public/api/gestor/newsOrders", {
    auth_token: args.auth_token,
    restaurant_id: args.restaurant_id,
  })
  .then((resp) => {
    socketIO.to(args.socket).emit("messageReceived", resp.data);
  })
  .catch((resp) => {
    console.log(resp);
  });
}
socketIO.on("connection", (socket) => {
  socket.on("disconnect", (reason) => {
      console.log("user desconnected "+reason);
  });
  socket.on("connected", (args) => {
    users[args.id] = {
      id: args.id,
      socket: socket.id,
      auth_token: args.auth_token,
      restaurant_id: args.restaurant_id
    };
    GetPrimaryData({
      socket: socket.id,
      auth_token: args.auth_token,
      restaurant_id: args.restaurant_id
    });
    // socketIO.to(socket.id).emit("messageReceived", "New user connected");
  });
  socket.on("ChangeRestaurant", (args) => {
    users[args.id].restaurant_id = args.restaurant_id;
    GetPrimaryData({
      socket: socket.id,
      auth_token: args.auth_token,
      restaurant_id: args.restaurant_id
    });
  });
 
});

http.listen(3001, () => {
  console.log("Server started "+3001);
});
