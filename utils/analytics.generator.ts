// import { Document, Model } from "mongoose";

// interface MonthData {
//   name: string;
//   count: number;
// }

// export async function generateLast12MonthsDate<T extends Document>(
//   model: Model<T>
// ): Promise<{ last12Months: MonthData[] }> {
//   const last12Months: MonthData[] = [];

//   const currentDate = new Date();

//   for (let i = 11; i >= 0; i--) {
//     const startDate = new Date(
//       currentDate.getFullYear(),
//       currentDate.getMonth() - i,
//       1
//     );

//     const endDate = new Date(
//       currentDate.getFullYear(),
//       currentDate.getMonth() - i + 1,
//       1
//     );

//     const count = await model.countDocuments({
//       createdAt: {
//         $gte: startDate,
//         $lt: endDate,
//       },
//     });

//     const monthYear = startDate.toLocaleString("default", {
//       month: "short",
//       year: "numeric",
//     });

//     last12Months.push({
//       name: monthYear,
//       count,
//     });
//   }

//   return { last12Months };
// }

// import { Document, Model } from "mongoose";

// interface MonthData {
//   month: string;
//   count: number;
// }

// export async function generateLast12MonthsDate<T extends Document>(
//   model: Model<T>
// ): Promise<{ last12Months: MonthData[] }> {
//   const last12Months: MonthData[] = [];

//   const currentDate = new Date();

//   for (let i = 11; i >= 0; i--) {
//     const startDate = new Date(
//       currentDate.getFullYear(),
//       currentDate.getMonth() - i,
//       1
//     );

//     const endDate = new Date(
//       currentDate.getFullYear(),
//       currentDate.getMonth() - i + 1,
//       1
//     );

//     const count = await model.countDocuments({
//       createdAt: {
//         $gte: startDate,
//         $lt: endDate,
//       },
//     });

//     const monthYear = startDate.toLocaleString("default", {
//       month: "short",
//       year: "numeric",
//     });

//     last12Months.push({
//       month: monthYear,
//       count,
//     });
//   }

//   return { last12Months };
// }

import { Document, Model } from "mongoose";

interface MonthData {
  month: string;
  count: number;
}

export async function generateLast12MonthsDate<T extends Document>(
  model: Model<T>
): Promise<{ last12Months: MonthData[] }> {
  const last12Months: MonthData[] = [];

  const currentDate = new Date();

  for (let i = 11; i >= 0; i--) {
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );

    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i + 1,
      1
    );

    const count = await model.countDocuments({
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const monthYear = startDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    last12Months.push({
      month: monthYear,
      count,
    });
  }

  return { last12Months };
}