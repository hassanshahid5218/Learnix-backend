import express, { NextFunction, Request, Response } from'express'
export const app=express();
import cors from 'cors';
import cookieParser from 'cookie-parser';
require('dotenv').config();
import { ErrorMiddleware } from './middleware/error';
import userRouter from './routes/user.route';
import courseRouter from './routes/course.route';
import orderRouter from './routes/order.route';
import notificationRoute from './routes/notification.route';
import analyticsRouter from './routes/analytics.route';
import layoutRouter from './routes/layout.route';
//body parser
app.use(express.json({limit:"50mb"}));

//cookie parser
app.use(cookieParser());

app.use(cors({
    origin:process.env.ORIGIN || "https://learnix-frontend-lyart.vercel.app",
    credentials: true,
}))

app.use('/api/v1',userRouter)
app.use('/api/v1',courseRouter)
app.use('/api/v1',orderRouter)
app.use('/api/v1',notificationRoute)
app.use('/api/v1',analyticsRouter)
app.use('/api/v1',layoutRouter)

app.get('/test',(req:Request,res:Response,next:NextFunction)=>{
    res.status(200).json({
        success:true,
        message:"API is working"
    })
})

app.all('/{*splat}',(req:Request,res:Response,next:NextFunction)=>{
    const err=new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode=404;
    next(err);
})

app.use(ErrorMiddleware);

// import express, { NextFunction, Request, Response } from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";

// require("dotenv").config();

// import { ErrorMiddleware } from "./middleware/error";
// import connectDB from "./utils/db";

// import userRouter from "./routes/user.route";
// import courseRouter from "./routes/course.route";
// import orderRouter from "./routes/order.route";
// import notificationRoute from "./routes/notification.route";
// import analyticsRouter from "./routes/analytics.route";
// import layoutRouter from "./routes/layout.route";

// export const app = express();

// // Body parser
// app.use(express.json({ limit: "50mb" }));

// // Cookie parser
// app.use(cookieParser());

// // CORS
// app.use(
//   cors({
//     origin: process.env.ORIGIN,
//     credentials: true,
//   })
// );

// // ----------------------------------------------------
// // DATABASE CONNECTION MIDDLEWARE
// // ----------------------------------------------------

// app.use(async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     await connectDB();
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // ----------------------------------------------------
// // API ROUTES
// // ----------------------------------------------------

// app.use("/api/v1", userRouter);
// app.use("/api/v1", courseRouter);
// app.use("/api/v1", orderRouter);
// app.use("/api/v1", notificationRoute);
// app.use("/api/v1", analyticsRouter);
// app.use("/api/v1", layoutRouter);

// // ----------------------------------------------------
// // TEST ROUTE
// // ----------------------------------------------------

// app.get("/test", (req: Request, res: Response) => {
//   res.status(200).json({
//     success: true,
//     message: "API is working",
//   });
// });

// // ----------------------------------------------------
// // 404
// // ----------------------------------------------------

// app.all("/*splat", (req: Request, res: Response, next: NextFunction) => {
//   const err = new Error(
//     `Route ${req.originalUrl} not found`
//   ) as any;

//   err.statusCode = 404;

//   next(err);
// });

// // ----------------------------------------------------
// // ERROR HANDLER
// // ----------------------------------------------------

// app.use(ErrorMiddleware);