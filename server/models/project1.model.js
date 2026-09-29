import mongoose, { Schema } from "mongoose";

const project1Schema = new Schema(
  {
    groupId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    projectTitle: {
      type: String,
      default: "",
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
            return members.length <= 3;
          },
          message: "Project 1 groups cannot have more than 3 members",
        },
      ],
    },
    appliedProfs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Professor",
      },
    ],
    allocatedProf: {
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
  },
  { timestamps: true }
);

// Pre-save middleware to validate group size
project1Schema.pre("save", function (next) {
  if (this.members && this.members.length > 3) {
    const error = new mongoose.Error.ValidationError(this);
    error.errors.members = new mongoose.Error.ValidatorError({
      message: "Project 1 groups cannot have more than 3 members",
      path: "members",
      value: this.members,
    });
    return next(error);
  }
  next();
});

// Pre-update middleware to validate group size
project1Schema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.$push && update.$push.members) {
    this.model
      .findOne(this.getQuery())
      .then((doc) => {
        if (doc.members.length >= 3) {
          const error = new mongoose.Error.ValidationError(this);
          error.errors.members = new mongoose.Error.ValidatorError({
            message: "Project 1 groups cannot have more than 3 members",
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
project1Schema.statics.addMemberWithValidation = async function (
  groupId,
  memberId
) {
  const group = await this.findById(groupId);
  if (!group) {
    throw new Error("Group not found");
  }

  if (group.members.length >= 3) {
    throw new Error("Project 1 groups cannot have more than 3 members");
  }

  group.members.push(memberId);
  return group.save();
};

// Custom validation method for update operations
project1Schema.statics.updateWithSizeValidation = async function (
  query,
  update
) {
  if (update.$push && update.$push.members) {
    const group = await this.findOne(query);
    if (!group) {
      throw new Error("Group not found");
    }

    if (group.members.length >= 3) {
      throw new Error("Project 1 groups cannot have more than 3 members");
    }
  }

  return this.updateOne(query, update);
};

export const Project1 = mongoose.model("Project1", project1Schema);
