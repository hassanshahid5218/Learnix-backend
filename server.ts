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


// import { app } from "./app";
// import { v2 as cloudinary } from "cloudinary";
// import http from "http";
// import connectDB from "./utils/db";
// import { initSocketServer } from "./socketServer";

// require("dotenv").config();

// // Cloudinary configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_SECRET_KEY,
// });

// // Vercel uses the Express app directly
// export default app;

// // Start HTTP server only when running locally
// if (process.env.NODE_ENV !== "production") {
//   const server = http.createServer(app);

//   initSocketServer(server);

//   const PORT = Number(process.env.PORT) || 3000;

//   server.listen(PORT, () => {
//     console.log(`Server is connected with port ${PORT}`);
//     connectDB();
//   });
// }



import { app } from "./app";

import { v2 as cloudinary } from "cloudinary";
import http from "http";

import connectDB from "./utils/db";
import { initSocketServer } from "./socketServer";

require("dotenv").config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

// Connect MongoDB and export the Express handler for Vercel
const handler = async (req: any, res: any) => {
  try {
    await connectDB();

    return app(req, res);
  } catch (error: any) {
    console.error("Database connection error:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
};

export default handler;

// Local development
if (process.env.NODE_ENV !== "production") {
  const server = http.createServer(app);

  initSocketServer(server);

  const PORT = Number(process.env.PORT) || 3000;

  server.listen(PORT, async () => {
    console.log(`Server is connected with port ${PORT}`);

    try {
      await connectDB();
    } catch (error) {
      console.error("Database connection failed:", error);
    }
  });
}

