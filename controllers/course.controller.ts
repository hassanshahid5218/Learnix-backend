// import { NextFunction, Request, Response } from "express";
// import { CatchAsyncError } from "../middleware/catchAsyncErrors";
// import ErrorHandler from "../utils/ErrorHandler";
// import cloudinary from "cloudinary";
// import { createCourse, getAllCoursesService } from "../services/course.service";
// import CourseModel from "../models/course.model";
// import { redis } from "../utils/redis";
// import mongoose from "mongoose";
// import path from "path";
// import ejs from "ejs";
// import sendMail from "../utils/sendMail";
// import NotificationModel from "../models/notification.model";
// import axios from "axios";
// // import NotificationModel from "../models/notification.model";
// // import axios from "axios";

// /**
//  * upload course
//  */
// export const uploadCourse = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const data = req.body;
//       const thumbnail = data.thumbnail;
//       if (thumbnail) {
//         const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
//           folder: "lmscourses",
//         });

//         data.thumbnail = {
//           public_id: myCloud.public_id,
//           url: myCloud.secure_url,
//         };
//       }
//       createCourse(data, res, next);
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );


// // edit course

// export const editCourse = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         console.log("BODY:", req.body);
//       console.log("PARAMS:", req.params);
//       const data = req.body;
//       console.log("Data",data)
//       if (!data) {
//     return next(new ErrorHandler("Request body is missing", 400));
//     }
//       const thumbnail = data.thumbnail;
//       const courseId = req.params.id;

//       const courseData = await CourseModel.findById(courseId);
//       console.log("courseId:", courseId);
//       console.log("courseData:", courseData);

//       if (!courseData) {
//         return next(new ErrorHandler("Course not found", 404));
//       }

//       // If a new thumbnail is provided
//       if (thumbnail && !thumbnail.startsWith("https")) {
//         // Delete old thumbnail from Cloudinary
//         if (courseData.thumbnail?.public_id) {
//           await cloudinary.v2.uploader.destroy(
//             courseData.thumbnail.public_id
//           );
//         }

//         // Upload new thumbnail
//         const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
//           folder: "courses",
//         });

//         data.thumbnail = {
//           public_id: myCloud.public_id,
//           url: myCloud.secure_url,
//         };
//       }

//       // If the existing thumbnail URL is sent,
//       // keep the existing Cloudinary public_id
//       if (thumbnail?.startsWith("https")) {
//         data.thumbnail = {
//           public_id: courseData.thumbnail?.public_id || "",
//           url: thumbnail,
//         };
//       }

//       const course = await CourseModel.findByIdAndUpdate(
//         courseId,
//         {
//           $set: data,
//         },
//         { new: true }
//       );

//       await redis.del("allCourses");

//       await redis.set(
//         courseId,
//         JSON.stringify(course),
//         "EX",
//         604800
//       );

//       res.status(201).json({
//         success: true,
//         course,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

// // get single course --- without purchasing
// export const getSingleCourse = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const courseId = req.params.id;

//       const isChacheExist = await redis.get(courseId.toString());

//       if (isChacheExist) {
//         const course = JSON.parse(isChacheExist);
//         res.status(200).json({
//           success: true,
//           course,
//         });
//       } else {
//         const course = await CourseModel.findById(req.params.id).select(
//           "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
//         );

//         await redis.set(courseId.toString(), JSON.stringify(course), "EX", 604800); // 7 days

//         res.status(200).json({
//           success: true,
//           course,
//         });
//       }
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

// // get all course --- without purchasing
// export const getAllCourses = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // const isChacheExist = await redis.get("allCourses")
//       // if (isChacheExist) {
//       //     const courses = JSON.parse(isChacheExist)
//       //     res.status(200).json({
//       //         success: true,
//       //         courses
//       //     })
//       // } else {
//       const courses = await CourseModel.find().select(
//         "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
//       );

//       await redis.set("allCourses", JSON.stringify(courses));

//       res.status(200).json({
//         success: true,
//         courses,
//       });
//       // }
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

// // get course content --- only for valid user
// export const getCourseByUser = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const userCourseList = req.user?.courses;
//       const courseId = req.params.id;

//       const courseExists = userCourseList?.find(
//         (course: any) => course._id === courseId
//       );

//       if (!courseExists) {
//         return next(
//           new ErrorHandler("You are not eligible to access this course", 500)
//         );
//       }

//       const course = await CourseModel.findById(courseId);
//     //   console.log("Course",course)

//       const content = course?.courseData;

//       res.status(200).json({
//         success: true,
//         content,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

// // add question in course
// interface IAddQuestionData {
//   question: string;
//   courseId: string;
//   contentId: string;
// }

// export const addQuestion = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { question, courseId, contentId }: IAddQuestionData = req.body;
//       const course = await CourseModel.findById(courseId);

//       if (!mongoose.Types.ObjectId.isValid(contentId)) {
//         return next(new ErrorHandler("Invalid content id", 400));
//       }

//       const courseContent = course?.courseData?.find((item: any) =>
//         item._id.equals(contentId)
//       );

//       if (!courseContent) {
//         return next(new ErrorHandler("Invalid content id", 400));
//       }

//       // create a new question object
//       const newQeustion: any = {
//         user: req.user,
//         question,
//         questionReplies: [],
//       };

//       // add this question to our course content
//       courseContent.questions.push(newQeustion);

//       await NotificationModel.create({
//         user: req.user?._id,
//         title: "New Question",
//         message: `You have a new order from ${courseContent.title}`,
//       });

//       // save the updated course
//       await course?.save();

//       res.status(200).json({
//         success: true,
//         course,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

// // add answer in course question
// interface IAddAnswerData {
//   answer: string;
//   courseId: string;
//   contentId: string;
//   questionId: string;
// }

// export const addAnswer = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { answer, courseId, contentId, questionId }: IAddAnswerData =
//         req.body;
//       const course = await CourseModel.findById(courseId);

//       if (!mongoose.Types.ObjectId.isValid(contentId)) {
//         return next(new ErrorHandler("Invalid content id", 400));
//       }

//       const courseContent = course?.courseData?.find((item: any) =>
//         item._id.equals(contentId)
//       );

//       if (!courseContent) {
//         return next(new ErrorHandler("Invalid content id", 400));
//       }

//       const question = courseContent?.questions?.find((item: any) =>
//         item._id.equals(questionId)
//       );

//       if (!question) {
//         return next(new ErrorHandler("Invalid question id", 400));
//       }

//       // create a new question object
//       const newAnswer: any = {
//         user: req.user,
//         answer,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       };

//       // add this question to our course content
//       question.questionReplies?.push(newAnswer);

//       // save the updated course
//       await course?.save();

//       if (req.user?._id === question.user._id) {
//         // create a notification
//         await NotificationModel.create({
//           user: req.user?._id,
//           title: "New Question Reply Received",
//           message: `You have a new order from ${courseContent.title}`,
//         });
//       } else {
//         const data = {
//           name: question.user.name,
//           title: courseContent.title,
//         };
//         const html = await ejs.renderFile(
//           path.join(__dirname, "../mails/question-reply.ejs"),
//           data
//         );

//         try {
//           await sendMail({
//             email: question.user.email,
//             subject: "Question Reply",
//             template: "question-reply.ejs",
//             data,
//           });
//           console.log("Mail sent")
//         } catch (error: any) {
//           return next(new ErrorHandler(error.message, 500));
//         }
//       }
//       res.status(200).json({
//         success: true,
//         course,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

// interface IAddReviewData {
//   review: string;
//   rating: string;
//   userId: string;
// }

// export const addReview = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const userCourseList = req.user?.courses;

//       const courseId = req.params.id;

//       // check if courseId already exists in userCourseList based on _id
//       const courseExists = userCourseList?.some(
//         (course: any) => course._id.toString() === courseId.toString()
//       );

//       if (!courseExists) {
//         return next(
//           new ErrorHandler("You are not eligible to access this course", 404)
//         );
//       }

//       const course = await CourseModel.findById(courseId);

//       const { review, rating } = req.body as IAddReviewData;

//       const reviewData: any = {
//         user: req.user,
//         rating,
//         comment: review,
//       };

//       course?.reviews.push(reviewData);

//       // make avarage rating
//       let avg = 0;
//       course?.reviews.forEach((rev: any) => {
//         avg += rev.rating;
//       });
//       if (course) {
//         course.ratings = avg / course.reviews.length;
//       }

//       await course?.save();

//       await redis.set(courseId.toString(), JSON.stringify(course), "EX", 604800); // 7 days

//     //   create notification
//       await NotificationModel.create({
//         user: req.user?._id,
//         title: "New Review Received",
//         message: `${req.user?.name} has given a review in ${course?.name}`,
//       });

//       res.status(200).json({
//         success: true,
//         course,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

// interface IAddReviewData {
//   comment: string;
//   courseId: string;
//   reviewId: string;
// }

// export const addReplyToReview = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { comment, courseId, reviewId } = req.body as IAddReviewData;

//       const course = await CourseModel.findById(courseId);

//       if (!course) {
//         return next(new ErrorHandler("Course not found", 404));
//       }

//       const review = course?.reviews?.find(
//         (rev: any) => rev._id.toString() === reviewId
//       );

//       if (!review) {
//         return next(new ErrorHandler("Course not found", 404));
//       }

//       const replyData: any = {
//         user: req.user,
//         comment,
//       };

//       if (!review.commentReplies) {
//         review.commentReplies = [];
//       }

//       review.commentReplies?.push(replyData);

//       await course?.save();

//       await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7 days

//       res.status(200).json({
//         success: true,
//         course,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

// // get all courses--- only for admin
// export const getAdminCourses = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       getAllCoursesService(res);
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

// // delete course-- only for admin
// export const deleteCourse = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { id } = req.params;

//       const course = await CourseModel.findById(id);

//       if (!course) {
//         return next(new ErrorHandler("Course not found", 404));
//       }

//       await course.deleteOne({ id });

//       await redis.del(id);

//       res.status(201).json({
//         success: true,
//         message: "Course deleted successfully",
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

// // generate video url

// export const generateVideoUrl = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { videoId } = req.body;
//       const response = await axios.post(
//         `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
//         { ttl: 300 },
//         {
//           headers: {
//             Accept: "application/json",
//             "Content-Type": "application/json",
//             Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
//           },
//         }
//       );

//       res.json(response.data);
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );


import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";

import cloudinary from "cloudinary";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import axios from "axios";

import {
  createCourse,
  getAllCoursesService,
} from "../services/course.service";

import CourseModel from "../models/course.model";
import NotificationModel from "../models/notification.model";

import { redis } from "../utils/redis";
import sendMail from "../utils/sendMail";

/**
 * Upload Course
 */
export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "lmscourses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/**
 * Edit Course
 */
export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("BODY:", req.body);
      console.log("PARAMS:", req.params);

      const data = req.body;

      if (!data) {
        return next(new ErrorHandler("Request body is missing", 400));
      }

      const thumbnail = data.thumbnail;
      const courseId = String(req.params.id);

      const courseData = await CourseModel.findById(courseId);

      console.log("courseId:", courseId);
      console.log("courseData:", courseData);

      if (!courseData) {
        return next(new ErrorHandler("Course not found", 404));
      }

      /**
       * If a new thumbnail is provided,
       * delete the old Cloudinary image first.
       */
      if (thumbnail && !thumbnail.startsWith("https")) {
        const oldThumbnail = courseData.thumbnail;

        if (oldThumbnail?.public_id) {
          await cloudinary.v2.uploader.destroy(oldThumbnail.public_id);
        }

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      /**
       * If the existing thumbnail URL is sent,
       * keep the existing Cloudinary public_id.
       */
      if (thumbnail?.startsWith("https")) {
        data.thumbnail = {
          public_id: courseData.thumbnail?.public_id || "",
          url: thumbnail,
        };
      }

      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        {
          new: true,
        }
      );

      await redis.del("allCourses");

      await redis.set(
        courseId,
        JSON.stringify(course),
        "EX",
        604800
      );

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/**
 * Get Single Course - Without Purchasing
 */
export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = String(req.params.id);

      const isCacheExist = await redis.get(courseId);

      if (isCacheExist) {
        const course = JSON.parse(isCacheExist);

        return res.status(200).json({
          success: true,
          course,
        });
      }

      const course = await CourseModel.findById(courseId).select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      );

      await redis.set(
        courseId,
        JSON.stringify(course),
        "EX",
        604800
      );

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/**
 * Get All Courses - Without Purchasing
 */
export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await CourseModel.find().select(
        "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
      );

      await redis.set("allCourses", JSON.stringify(courses));

      res.status(200).json({
        success: true,
        courses,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/**
 * Get Course Content - Only For Valid User
 */
// export const getCourseByUser = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const userCourseList = req.user?.courses;
//       const courseId = String(req.params.id);

//       const courseExists = userCourseList?.find(
//         (course: any) => course._id.toString() === courseId
//       );

//       if (!courseExists) {
//         return next(
//           new ErrorHandler(
//             "You are not eligible to access this course",
//             500
//           )
//         );
//       }

//       const course = await CourseModel.findById(courseId);

//       const content = course?.courseData;

//       res.status(200).json({
//         success: true,
//         content,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );

export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = String(req.params.id);

      const userCourseList = req.user?.courses;

      if (!userCourseList || userCourseList.length === 0) {
        return next(
          new ErrorHandler(
            "You are not eligible to access this course",
            403
          )
        );
      }

      // Check the actual courseId stored in the user's purchased courses
      const courseExists = userCourseList.some(
        (course: any) =>
          course?.courseId?.toString() === courseId
      );

      if (!courseExists) {
        return next(
          new ErrorHandler(
            "You are not eligible to access this course",
            403
          )
        );
      }

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(
          new ErrorHandler("Course not found", 404)
        );
      }

      const content = course.courseData;

      return res.status(200).json({
        success: true,
        content,
      });
    } catch (error: any) {
      return next(
        new ErrorHandler(error.message, 500)
      );
    }
  }
);



/**
 * Add Question In Course
 */
interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId }: IAddQuestionData = req.body;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      const courseContent = course.courseData.find((item: any) =>
        item._id.equals(contentId)
      );

      if (!courseContent) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      const newQuestion = {
        user: req.user,
        question,
        questionReplies: [],
      };

      courseContent.questions.push(newQuestion as any);

      await NotificationModel.create({
        user: req.user?._id,
        title: "New Question",
        message: `You have a new question from ${courseContent.title}`,
      });

      await course.save();

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/**
 * Add Answer In Course Question
 */
interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

export const addAnswer = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        answer,
        courseId,
        contentId,
        questionId,
      }: IAddAnswerData = req.body;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      const courseContent = course.courseData.find((item: any) =>
        item._id.equals(contentId)
      );

      if (!courseContent) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      if (!mongoose.Types.ObjectId.isValid(questionId)) {
        return next(new ErrorHandler("Invalid question id", 400));
      }

      const question = courseContent.questions?.find((item: any) =>
        item._id.equals(questionId)
      );

      if (!question) {
        return next(new ErrorHandler("Invalid question id", 400));
      }

      const newAnswer = {
        user: req.user,
        answer,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      question.questionReplies?.push(newAnswer as any);

      await course.save();

      if (req.user?._id?.toString() === question.user?._id?.toString()) {
        await NotificationModel.create({
          user: req.user?._id,
          title: "New Question Reply Received",
          message: `You have a new reply on ${courseContent.title}`,
        });
      } else {
        const data = {
          name: question.user.name,
          title: courseContent.title,
        };

        await ejs.renderFile(
          path.join(__dirname, "../mails/question-reply.ejs"),
          data
        );

        try {
          await sendMail({
            email: question.user.email,
            subject: "Question Reply",
            template: "question-reply.ejs",
            data,
          });

          console.log("Mail sent");
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }
      }

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/**
 * Add Review
 */
interface IAddReviewData {
  review: string;
  rating: string;
  userId: string;
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = String(req.params.id);

      const courseExists = userCourseList?.some(
  (course: any) =>
    course?.courseId?.toString() === courseId
);

      if (!courseExists) {
        return next(
          new ErrorHandler(
            "You are not eligible to access this course",
            404
          )
        );
      }

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const { review, rating } = req.body as IAddReviewData;

      const reviewData = {
        user: req.user,
        rating: Number(rating),
        comment: review,
      };

      course.reviews.push(reviewData as any);

      let avg = 0;

      course.reviews.forEach((rev: any) => {
        avg += Number(rev.rating);
      });

      course.ratings = avg / course.reviews.length;

      await course.save();

      await redis.set(
        courseId,
        JSON.stringify(course),
        "EX",
        604800
      );

      await NotificationModel.create({
        user: req.user?._id,
        title: "New Review Received",
        message: `${req.user?.name} has given a review in ${course.name}`,
      });

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/**
 * Add Reply To Review
 */
interface IAddReplyToReviewData {
  comment: string;
  courseId: string;
  reviewId: string;
}

export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        comment,
        courseId,
        reviewId,
      }: IAddReplyToReviewData = req.body;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const review = course.reviews?.find(
        (rev: any) => rev._id.toString() === reviewId
      );

      if (!review) {
        return next(new ErrorHandler("Review not found", 404));
      }

      const replyData = {
        user: req.user,
        comment,
      };

      if (!review.commentReplies) {
        review.commentReplies = [];
      }

      review.commentReplies.push(replyData as any);

      await course.save();

      await redis.set(
        String(courseId),
        JSON.stringify(course),
        "EX",
        604800
      );

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/**
 * Get All Courses - Admin
 */
export const getAdminCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllCoursesService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

/**
 * Delete Course - Admin
 */
export const deleteCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);

      const course = await CourseModel.findById(id);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      await course.deleteOne();

      await redis.del(id);

      res.status(201).json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

/**
 * Generate Video URL
 */
export const generateVideoUrl = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoId } = req.body;

      const response = await axios.post(
        `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
        {
          ttl: 300,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
          },
        }
      );

      res.json(response.data);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

