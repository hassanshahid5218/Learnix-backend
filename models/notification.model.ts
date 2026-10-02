// import mongoose, { Document, Model, Schema } from "mongoose";

// export interface INotification extends Document {
//     title: string;
//     message: string;
//     status: string;
//     userId: string;
// }

// const notificatioinSchema = new Schema<INotification>({
//     title: {
//         type: String,
//         required: true
//     },
//     message: {
//         type: String,
//         required: true
//     },
//     status: {
//         type: String,
//         required: true
//         , default: "unread"
//     },
// }, { timestamps: true })

// const NotificationModel: Model<INotification> = mongoose.model('Notification', notificatioinSchema)

// export default NotificationModel

import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
    title: string;
    message: string;
    status: string;
    user: mongoose.Types.ObjectId;
}

const notificationSchema = new Schema<INotification>(
    {
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            default: "unread",
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const NotificationModel: Model<INotification> =
    mongoose.model("Notification", notificationSchema);

export default NotificationModel;