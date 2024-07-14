import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    name: {
      type: Schema.Types.ObjectId, 
      ref: 'User',
    },
    projectName: {
      type: String,
      required: [true, "Enter Name of your project!"],
    },
    domain: {
      type: String,
      required: [true, "Enter domain of your project!"],
    },
    projectLink: {
      type: String,
      required: [true, "Enter Github repo/deployement link"],
    },
    techStack: {
      type: String,
    },
    guide: {
      type: String,
    },
    doc: {
      type: String,
      required: [true, "Add supporting docs!"],
    },
  },
  { timestamps: true }
);
export const Project = mongoose.model("Project", projectSchema);
