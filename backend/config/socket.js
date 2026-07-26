import { Server } from "socket.io";

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ClIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected : ${socket.id}`);

    socket.on("disconnected", (socket) => {
      console.log(`User disconnected ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized");
  }
  return io;
};

export default { initializeSocket, getIO };
