import mongoose, { Schema } from "mongoose";
const majorSchema = new Schema({
  groupId: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ["industrial", "research"],
    required: [true, "Internship type is required!"],
  },
  org: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: function () {
      return this.type === "industrial";
    },
  },
  leader: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  members: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    validate: [
      {
        validator: function(members) {
          return members.length <= 2;
        },
        message: "major project groups cannot have more than 2 members"
      }
    ]
  },
  majorAppliedProfs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Professor",
    },
  ],
  majorAllocatedProf: {
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
      absent: [{
        type: Schema.Types.ObjectId,
        ref: "User",
      }],
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
  typeChangeRequests: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      requestedType: {
        type: String,
        enum: ["industrial", "research"],
        required: true,
      },
      org: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: function () {
          return this.requestedType === "industrial";
        },
      },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      initiatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Pre-save middleware to validate group size before any save operation
majorSchema.pre('save', function(next) {
  if (this.members && this.members.length > 2) {
    const error = new mongoose.Error.ValidationError(this);
    error.errors.members = new mongoose.Error.ValidatorError({
      message: 'major project groups cannot have more than 2 members',
      path: 'members',
      value: this.members
    });
    return next(error);
  }
  next();
});

// Pre-update middleware to validate group size before any update operation
majorSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.$push && update.$push.members) {
    this.model.findOne(this.getQuery())
      .then(doc => {
        if (doc.members.length >= 2) {
          const error = new mongoose.Error.ValidationError(this);
          error.errors.members = new mongoose.Error.ValidatorError({
            message: 'major project groups cannot have more than 2 members',
            path: 'members',
            value: doc.members
          });
          return next(error);
        }
        next();
      })
      .catch(err => next(err));
  } else {
    next();
  }
});

// Static method to validate group size when adding members
majorSchema.statics.addMemberWithValidation = async function(groupId, memberId) {
  const group = await this.findById(groupId);
  if (!group) {
    throw new Error("Group not found");
  }
  
  if (group.members.length >= 2) {
    throw new Error("major project groups cannot have more than 2 members");
  }
  
  group.members.push(memberId);
  return group.save();
};

// Custom validation method for update operations
majorSchema.statics.updateWithSizeValidation = async function(query, update) {
  // If we're adding to members array
  if (update.$push && update.$push.members) {
    const group = await this.findOne(query);
    if (!group) {
      throw new Error("Group not found");
    }
    
    if (group.members.length >= 2) {
      throw new Error("Major project groups cannot have more than 2 members");
    }
  }
  
  return this.updateOne(query, update);
};

export const Major = mongoose.model("Major", majorSchema);
