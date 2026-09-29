import mongoose, { Schema } from "mongoose";
const CompanySchema = new Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required!"],
    },
  },
  {
    timestamps: true,
  }
);

export const Company = mongoose.model("Company", CompanySchema);
