import mongoose, { Schema } from "mongoose";
const minorSchema = new Schema({
  groupId: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  leader: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  members: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    validate: [
      {
        validator: function (members) {
          return members.length <= 2;
        },
        message: "Minor project groups cannot have more than 2 members",
      },
    ],
  },
  minorAppliedProfs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Professor",
    },
  ],
  minorAllocatedProf: {
    type: Schema.Types.ObjectId,
    ref: "Professor",
  },
  deniedProf: [
    {
      type: Schema.Types.ObjectId,
      ref: "Professor",
    },
  ],
  discussion: [
    {
      _id: {
        type: Schema.Types.ObjectId,
        auto: true,
      },
      date: {
        type: Date,
        default: new Date(),
      },
      absent: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      description: {
        type: String,
      },
      remark: {
        type: String,
      },
    },
  ],
  preferenceLastMovedAt: {
    type: Date,
    default: Date.now,
  },
  chats: {
    type: String,
    ref: "Chat",
  },
});

// Pre-save middleware to validate group size before any save operation
minorSchema.pre("save", function (next) {
  if (this.members && this.members.length > 2) {
    const error = new mongoose.Error.ValidationError(this);
    error.errors.members = new mongoose.Error.ValidatorError({
      message: "Minor project groups cannot have more than 2 members",
      path: "members",
      value: this.members,
    });
    return next(error);
  }
  next();
});

// Pre-update middleware to validate group size before any update operation
minorSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.$push && update.$push.members) {
    this.model
      .findOne(this.getQuery())
      .then((doc) => {
        if (doc.members.length >= 2) {
          const error = new mongoose.Error.ValidationError(this);
          error.errors.members = new mongoose.Error.ValidatorError({
            message: "Minor project groups cannot have more than 2 members",
            path: "members",
            value: doc.members,
          });
          return next(error);
        }
        next();
      })
      .catch((err) => next(err));
  } else {
    next();
  }
});

// Static method to validate group size when adding members
minorSchema.statics.addMemberWithValidation = async function (
  groupId,
  memberId
) {
  const group = await this.findById(groupId);
  if (!group) {
    throw new Error("Group not found");
  }

  if (group.members.length >= 2) {
    throw new Error("Minor project groups cannot have more than 2 members");
  }

  group.members.push(memberId);
  return group.save();
};

// Custom validation method for update operations
minorSchema.statics.updateWithSizeValidation = async function (query, update) {
  // If we're adding to members array
  if (update.$push && update.$push.members) {
    const group = await this.findOne(query);
    if (!group) {
      throw new Error("Group not found");
    }

    if (group.members.length >= 2) {
      throw new Error("Minor project groups cannot have more than 2 members");
    }
  }

  return this.updateOne(query, update);
};

export const Minor = mongoose.model("Minor", minorSchema);
