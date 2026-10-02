// import { Server as SocketIOServer } from "socket.io";
// import http from "http";

// export const initSocketServer = (server: http.Server) => {
//   const io = new SocketIOServer(server);

//   io.on("connection", (socket) => {
//     console.log("A user connected");

//     // listen for 'notification' event from the frontend
//     socket.on("notification", (data) => {
//       // broadcast the notification data to all connected clients (admin dashboard)
//       io.emit("newNotification", data);
//     });

//     socket.on("disconnect", () => {
//       console.log("A user disconnected");
//     });
//   });
// };

import { Server as SocketIOServer } from "socket.io";
import http from "http";

export const initSocketServer = (server: http.Server) => {
const io = new SocketIOServer(server, {
cors: {
origin: process.env.ORIGIN,
credentials: true,
},
transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
console.log("A user connected");

// Listen for notification events from the frontend
socket.on("notification", (data) => {
  // Broadcast the notification data to all connected clients
  io.emit("newNotification", data);
});

socket.on("disconnect", () => {
  console.log("A user disconnected");
});

});

return io;
};