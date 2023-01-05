const express = require("express");

const app = express();

const http = require("http");

const cors = require("cors");

const socketIO = require("socket.io");

app.use(cors());

const server = http.createServer(app);

let users = {};
let rooms = {};

app.get("/", (req, res, next) => {
  res.send("<html><h1>Server is working fine...</h1></html>");
});

const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("user_joined", (userData) => {
    users[socket.id] = userData.username;
    rooms[socket.id] = userData.roomId;

    socket.to(userData.roomId).emit("new_user_joined", userData);
  });

  socket.on("join_room", ({ username, roomId }) => {
    socket.join(roomId);
  });

  socket.on("send_message", (message) => {
    socket.to(message.roomId).emit("receive_message", {
      message: message,
    });
  });

  socket.on("disconnect", (message) => {
    socket.to(rooms[socket.id]).emit("left", { username: users[socket.id] });
    delete users[socket.id];
  });
});

server.listen(process.env.PORT || 2000);
