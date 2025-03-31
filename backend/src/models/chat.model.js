import mongoose, { Schema } from "mongoose";
import { Group } from "./group.model.js";

const chatSchema = new Schema({
    groupId: {
        type: String,
        ref: Group,
    },
    messages: [
        {
            sender: {
                type: String,
            },
            text: {
                type: String,
                required: [true, "Message cannot be empty!"],
            },
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],
})

chatSchema.pre("save", async function (next) {
    if (this.isNew) {
        const group = await Group.findOne({groupId: this.groupId});
        if (!group) {
            return next(new Error("Group not found"));
        }
        this.messages = [];
    }
    next();
});

const Chat = mongoose.model("Chat", chatSchema);
export { Chat };