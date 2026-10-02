// import mongoose from "mongoose";
// require('dotenv').config();

// const dbUrl:string=process.env.DB_URL || '';
// const connectDB=async()=>{
//     try{
//        await mongoose.connect(dbUrl).then((data:any)=>{
//         console.log(`Database connected with ${data.connection.host}`)
//        })

//     }catch(error:any){
//         console.log(error.message);
//         setTimeout(connectDB,5000)
//     }
// }

// export default connectDB;

// import mongoose from "mongoose";

//  require('dotenv').config()
// const dbUrl: string = process.env.DB_URL || '';

// const connectDB = async () => {
//     // 1. If already connected, reuse the existing database connection safely
//     if (mongoose.connection.readyState >= 1) {
//         console.log("Database already connected. Reusing connection.");
//         return;
//     }

//     try {
//         // 2. Connect with strict serverless rules to avoid infinite hanging
//         const data = await mongoose.connect(dbUrl, {
//             bufferCommands: false,         // Don't queue up commands if connection drops
//             serverSelectionTimeoutMS: 5000 // Stop waiting and fail fast if MongoDB is unreachable
//         });
        
//         console.log(`Database connected with ${data.connection.host}`);
//     } catch (error: any) {
//         console.error("Database connection failed:", error.message);
//         // 3. DO NOT use setTimeout here. Throw the error so Vercel can recycle the failed function context.
//         throw error; 
//     }
// };

// export default connectDB;


import mongoose from "mongoose";

require("dotenv").config();

const connectDB = async () => {
const dbUrl = process.env.DB_URL;

if (!dbUrl) {
throw new Error("DB_URL is not defined in environment variables.");
}

// Reuse an existing connection in Vercel/serverless environments
if (mongoose.connection.readyState >= 1) {
console.log("Database already connected. Reusing connection.");
return;
}

try {
const data = await mongoose.connect(dbUrl, {
bufferCommands: false,
serverSelectionTimeoutMS: 10000,
});

console.log(`Database connected with ${data.connection.host}`);

} catch (error: any) {
console.error("Database connection failed:", error.message);
throw error;
}
};

export default connectDB;