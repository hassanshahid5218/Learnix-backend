// import { NextFunction, Request, Response } from "express";
// import { CatchAsyncError } from "../middleware/catchAsyncErrors";
// import { IOrder } from "../models/order.model";
// import userModel from "../models/user.model";
// import ErrorHandler from "../utils/ErrorHandler";
// import CourseModel, { ICourse } from "../models/course.model";
// import { getAllOrdersService, newOrder } from "../services/order.service";
// import sendMail from "../utils/sendMail";
// import path from "path";
// import ejs from "ejs";
// import NotificationModel from "../models/notification.model";
// // import { getAllCoursesService } from "../services/course.service";
// import { redis } from "../utils/redis";
// require("dotenv").config();
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// // create order
// export const createOrder = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { courseId, payment_info } = req.body as IOrder;

//       if (payment_info) {
//         if ("id" in payment_info) {
//           const paymentIntentId = payment_info.id;
//           const paymentIntent = await stripe.paymentIntents.retrieve(
//             paymentIntentId
//           );

//           if (paymentIntent.status !== "succeeded") {
//             return next(new ErrorHandler("Payment not authorized!", 400));
//           }
//         }
//       }

//       const user = await userModel.findById(req.user?._id);

//       const courseExistsInUser = user?.courses.some(
//         (course: any) => course._id.toString() === courseId
//       );

//       if (courseExistsInUser) {
//         return next(
//           new ErrorHandler("You have already purchased this course", 400)
//         );
//       }

//       const course: ICourse | null = await CourseModel.findById(courseId);

//       if (!course) {
//         return next(new ErrorHandler("Course not found", 404));
//       }

//       const data: any = {
//         courseId: course._id,
//         userId: user?._id,
//         payment_info,
//       };

//       const mailData = {
//         order: {
//           _id: course._id.toString().slice(0, 6),
//           name: course.name,
//           price: course.price,
//           date: new Date().toLocaleDateString("en-US", {
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//           }),
//         },
//       };

//       const html = await ejs.renderFile(
//         path.join(__dirname, "../mails/order-confirmation.ejs"),
//         { order: mailData }
//       );

//       try {
//         if (user) {
//           await sendMail({
//             email: user.email,
//             subject: "Order Confirmation",
//             template: "order-confirmation.ejs",
//             data: mailData,
//           });
//         }
//       } catch (error: any) {
//         return next(new ErrorHandler(error.message, 500));
//       }

//       user?.courses.push(course?._id.toString());

//       await redis.set(req.user?._id.toString(), JSON.stringify(user));

//       await user?.save();

//       await NotificationModel.create({
//         user: user?._id,
//         title: "New Order",
//         message: `You have a new order from ${course?.name}`,
//       });

//       course.purchased += 1;

//       await course.save();

//       newOrder(data, res, next);
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

// // get all orders --- only for admin
// export const getAllOrders = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       getAllOrdersService(res);
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );


// // sent stripe publishie key
// export const sendStripePublshableKey = CatchAsyncError(
//   async (req: Request, res: Response) => {
//     res.status(200).json({
//       publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
//     });
//   }
// );

// //ney payment
// export const newPayment = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const myPayment = await stripe.paymentIntents.create({
//         amount: req.body.amount,
//         currency: "USD",
//         metadata: {
//           company: "E-Learning",
//         },
//         automatic_payment_methods: {
//           enabled: true,
//         },
//       });

//       res.status(200).json({
//         success: true,
//         client_secret: myPayment.client_secret,
//       });
//     } catch (error: any) {}
//   }
// );


import { NextFunction, Request, Response } from "express";

import { CatchAsyncError } from "../middleware/catchAsyncErrors";

import { IOrder } from "../models/order.model";

import userModel from "../models/user.model";

import ErrorHandler from "../utils/ErrorHandler";

import CourseModel, { ICourse } from "../models/course.model";

import {
  getAllOrdersService,
  newOrder,
} from "../services/order.service";

import sendMail from "../utils/sendMail";

import path from "path";

import ejs from "ejs";

import NotificationModel from "../models/notification.model";

import { redis } from "../utils/redis";

require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// ----------------------------------------------------
// CREATE ORDER
// ----------------------------------------------------

export const createOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_info } = req.body as IOrder;

      // Make sure authenticated user exists
      const userId = req.user?._id;

      if (!userId) {
        return next(new ErrorHandler("User not authenticated", 401));
      }

      // Verify Stripe payment
      if (payment_info) {
        if ("id" in payment_info) {
          const paymentIntentId = payment_info.id;

          const paymentIntent =
            await stripe.paymentIntents.retrieve(paymentIntentId);

          if (paymentIntent.status !== "succeeded") {
            return next(
              new ErrorHandler("Payment not authorized!", 400)
            );
          }
        }
      }

      // Find user
      const user = await userModel.findById(userId);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Check if course is already purchased
      const courseExistsInUser = user.courses.some(
        (course: any) => course._id?.toString() === courseId
      );

      if (courseExistsInUser) {
        return next(
          new ErrorHandler(
            "You have already purchased this course",
            400
          )
        );
      }

      // Find course
      const course: ICourse | null =
        await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      // Order data
      const data: any = {
        courseId: course._id,
        userId: user._id,
        payment_info,
      };

      // Email data
      const mailData = {
        order: {
          _id: course._id.toString().slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      // Render email template
      await ejs.renderFile(
        path.join(
          __dirname,
          "../mails/order-confirmation.ejs"
        ),
        { order: mailData }
      );

      // Send confirmation email
      try {
        await sendMail({
          email: user.email,
          subject: "Order Confirmation",
          template: "order-confirmation.ejs",
          data: mailData,
        });
      } catch (error: any) {
        return next(
          new ErrorHandler(error.message, 500)
        );
      }

      // Add purchased course to user's courses
      user.courses.push({
        courseId: course._id.toString(),
      });

      // Update Redis user cache
      await redis.set(
        userId.toString(),
        JSON.stringify(user)
      );

      // Save user
      await user.save();

      // Create notification
      await NotificationModel.create({
        userId: user._id,
        title: "New Order",
        message: `You have a new order from ${course.name}`,
      });

      // Increase course purchase count
      course.purchased += 1;

      await course.save();

      // Create order
      newOrder(data, res, next);
    } catch (error: any) {
      return next(
        new ErrorHandler(error.message, 500)
      );
    }
  }
);

// ----------------------------------------------------
// GET ALL ORDERS - ONLY FOR ADMIN
// ----------------------------------------------------

export const getAllOrders = CatchAsyncError(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      getAllOrdersService(res);
    } catch (error: any) {
      return next(
        new ErrorHandler(error.message, 400)
      );
    }
  }
);

// ----------------------------------------------------
// SEND STRIPE PUBLISHABLE KEY
// ----------------------------------------------------

export const sendStripePublshableKey = CatchAsyncError(
  async (req: Request, res: Response) => {
    res.status(200).json({
      publishableKey:
        process.env.STRIPE_PUBLISHABLE_KEY,
    });
  }
);

// ----------------------------------------------------
// NEW PAYMENT
// ----------------------------------------------------

export const newPayment = CatchAsyncError(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const myPayment =
        await stripe.paymentIntents.create({
          amount: req.body.amount,
          currency: "USD",
          metadata: {
            company: "E-Learning",
          },
          automatic_payment_methods: {
            enabled: true,
          },
        });

      res.status(200).json({
        success: true,
        client_secret: myPayment.client_secret,
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(error.message, 500)
      );
    }
  }
);

