// require('dotenv').config()
// import { Response } from "express"
// import { redis } from "./redis";
// import { IUser } from "../models/user.model";

// interface ITokenOptions {
//     expires: Date;
//     maxAge: number;
//     httpOnly: boolean;
//     sameSite: 'lax' | 'strict' | 'none' | undefined
//     secure?: boolean
// }

// // parse enviroment variables to integates with fallback values 
// const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10)
// const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10)

// //option for cookies
// export const accessTokenOptions: ITokenOptions = {
//     expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
//     maxAge: accessTokenExpire  * 60 * 1000,
//     httpOnly: true,
//     sameSite: 'lax'
// };
// export const refreshTokenOptions: ITokenOptions = {
//     expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
//     maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
//     httpOnly: true,
//     sameSite: 'lax'
// };


// export const sendToken = (user: IUser, statusCode: number, res: Response) => {
//     const accessToken = user.SignAccessToken()
//     const refreshToken = user.SignRefreshToken()

//     // upload session to redis
//     redis.set(user._id.toString(), JSON.stringify(user) as any)


//     // only set secure to true in production
//     if (process.env.NODE_ENV === 'production') {
//         accessTokenOptions.secure = true;
//     }

//     res.cookie("access_token", accessToken, accessTokenOptions)
//     res.cookie("refresh_token", refreshToken, refreshTokenOptions)

//     res.status(statusCode).json({
//         success: true, user, accessToken
//     })
// }


// require("dotenv").config();

// import { Response } from "express";
// import { redis } from "./redis";
// import { IUser } from "../models/user.model";

// interface ITokenOptions {
//   expires: Date;
//   maxAge: number;
//   httpOnly: boolean;
//   sameSite: "lax" | "strict" | "none";
//   secure: boolean;
// }

// // Token expiration values
// const accessTokenExpire = parseInt(
//   process.env.ACCESS_TOKEN_EXPIRE || "300",
//   10
// );

// const refreshTokenExpire = parseInt(
//   process.env.REFRESH_TOKEN_EXPIRE || "1200",
//   10
// );

// // Detect production environment
// const isProduction = process.env.NODE_ENV === "production";

// // Access token cookie options
// export const accessTokenOptions: ITokenOptions = {
//   expires: new Date(
//     Date.now() + accessTokenExpire * 60 * 60 * 1000
//   ),
//   maxAge: accessTokenExpire * 60 * 1000,
//   httpOnly: true,
//   sameSite: isProduction ? "none" : "lax",
//   secure: isProduction,
// };

// // Refresh token cookie options
// export const refreshTokenOptions: ITokenOptions = {
//   expires: new Date(
//     Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000
//   ),
//   maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
//   httpOnly: true,
//   sameSite: isProduction ? "none" : "lax",
//   secure: isProduction,
// };

// // Send access and refresh tokens
// export const sendToken = (
//   user: IUser,
//   statusCode: number,
//   res: Response
// ) => {
//   const accessToken = user.SignAccessToken();
//   const refreshToken = user.SignRefreshToken();

//   // Save user session in Redis
//   redis.set(
//     user._id.toString(),
//     JSON.stringify(user) as any
//   );

//   // Set authentication cookies
//   res.cookie(
//     "access_token",
//     accessToken,
//     accessTokenOptions
//   );

//   res.cookie(
//     "refresh_token",
//     refreshToken,
//     refreshTokenOptions
//   );

//   // Send response
//   res.status(statusCode).json({
//     success: true,
//     user,
//     accessToken,
//   });
// };


require("dotenv").config();

import { Response } from "express";
import { redis } from "./redis";
import { IUser } from "../models/user.model";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
}

const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);

const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "1200",
  10
);

// Vercel production detection
const isProduction =
  process.env.VERCEL_ENV === "production" ||
  process.env.NODE_ENV === "production";

export const accessTokenOptions: ITokenOptions = {
  expires: new Date(
    Date.now() + accessTokenExpire * 60 * 1000
  ),
  maxAge: accessTokenExpire * 60 * 1000,
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
};

export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(
    Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000
  ),
  maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
};

export const sendToken = (
  user: IUser,
  statusCode: number,
  res: Response
) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  redis.set(
    user._id.toString(),
    JSON.stringify(user) as any
  );

  res.cookie(
    "access_token",
    accessToken,
    accessTokenOptions
  );

  res.cookie(
    "refresh_token",
    refreshToken,
    refreshTokenOptions
  );

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};

