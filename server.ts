// import { app } from "./app";
// import { v2 as cloudinary } from "cloudinary";
// import http from "http";
// import connectDB from "./utils/db";
// import { initSocketServer } from "./socketServer";
// require("dotenv").config();
// const server = http.createServer(app);

// // cloudinary config
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_SECRET_KEY,
// });

// initSocketServer(server);

// // create server
// server.listen(process.env.PORT, () => {
//   console.log(`Server is connected with port ${process.env.PORT}`);
//   connectDB();
// });

import "dotenv/config";

import { app } from "./app";
import { v2 as cloudinary } from "cloudinary";
import http from "http";
import connectDB from "./utils/db";
import { initSocketServer } from "./socketServer";
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first'); // 💡 Tells Vercel to route to MongoDB using IPv4


const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer(app);

// Cloudinary configuration
cloudinary.config({
cloud_name: process.env.CLOUD_NAME,
api_key: process.env.CLOUD_API_KEY,
api_secret: process.env.CLOUD_SECRET_KEY,
});

// Socket.IO
initSocketServer(server);

// Start server
server.listen(PORT, async () => {
console.log(`Learnix server is running on port ${PORT}`);

try {
await connectDB();
console.log("Database connected successfully");
} catch (error) {
console.error("Database connection failed:", error);
}
});