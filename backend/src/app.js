import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
import { User } from "./models/user.model.js";
import { Company } from "./models/company.model.js";
import { Professor } from "./models/professor.model.js";



app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.set("trust proxy", 1);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import academicsRouter from "./routes/academic.routes.js";
app.use("/api/v1/academics", academicsRouter);

import examRouter from "./routes/exam.routes.js";
import higherEducationRouter from "./routes/higher-education.routes.js";
import projectRouter from "./routes/project.routes.js";

app.use("/api/v1/project", projectRouter);
app.use("/api/v1/exam", examRouter);
app.use("/api/v1/higher-education", higherEducationRouter);

import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);

import peCourseRouter from "./routes/peCourse.routes.js";
app.use(
  "/api/v1/pe",
  (req, res, next) => {
    next();
  },
  peCourseRouter
);

import adminRouter from "./routes/admin.routes.js";
app.use("/api/v1/admin", adminRouter);
import awardRouter from "./routes/award.routes.js";
app.use("/api/v1/awards", awardRouter);

import InternShipRouter from "./routes/internship.routes.js";
app.use("/api/v1/intern", InternShipRouter);

import reviewRoutes from "./routes/review.routes.js";
app.use("/api/v1", reviewRoutes);

import backlogRoutes from "./routes/backlog.routes.js";
app.use("/api/v1/backlogs", backlogRoutes);

import classroomRouter from "./routes/classroom.routes.js";
app.use("/api/v1/classroom", classroomRouter);

import alumniRouter from "./routes/alumni.routes.js";
app.use("/api/v1/alumni", alumniRouter);

import profProjectRouter from "./routes/profProject.routes.js";
app.use("/api/v1/profProject", profProjectRouter);

import profRouter from "./routes/professor.routes.js";
app.use("/api/v1/prof", profRouter);

import groupRouter from "./routes/group.routes.js";
app.use("/api/v1/group", groupRouter);

import minorRouter from "./routes/minor.routes.js";
app.use("/api/v1/minor", minorRouter);

import majorRouter from "./routes/major.routes.js";
app.use("/api/v1/major", majorRouter);

import bugRouter from "./routes/bugtracker.routes.js";
app.use("/api/v1/tracker", bugRouter);

import chatRouter from "./routes/chat.routes.js";
app.use("/api/v1/chat", chatRouter);

// Import error handlers
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.middleware.js";

// Handle 404 routes - must be after all other routes
app.use(notFoundHandler);

// Global error handler - must be the last middleware
// Temporary debug test for companyInterview

const testKushagra = async () => {
  try {
    const user = await User.findOne({
      email: "btech10060.22@bitmesra.ac.in",
    });

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log("========== RAW USER ==========");
    console.log("Email:", user.email);
    console.log("User ID:", user._id);
    console.log("companyInterview (raw):", user.companyInterview);
    console.log("Type of first item:", typeof user.companyInterview[0]);
    console.log("Is Array?", Array.isArray(user.companyInterview));
    console.log("Array Length:", user.companyInterview.length);

    console.log("\n========== POPULATED ==========");

    const populatedUser = await User.findOne({
      email: "btech10060.22@bitmesra.ac.in",
    }).populate("companyInterview");

    console.log(
      "companyInterview (populated):",
      populatedUser.companyInterview
    );

    const company = await Company.findOne({
  companyName: { $regex: "grid dynamics", $options: "i" }
});
console.log(company);

  } catch (error) {
    console.error("Error:", error);
  }
};

// testKushagra();

const assignLumberfi = async () => {
  try {
    const user = await User.findOne({
      email: "btech10060.22@bitmesra.ac.in",
    });

    const company = await Company.findOne({
      companyName: "Grid Dynamics",
    });

    if (!user) {
      console.log("User not found");
      return;
    }

    if (!company) {
      console.log("Company not found");
      return;
    }

    await User.updateOne(
      { email: "btech10060.22@bitmesra.ac.in" },
      { $addToSet: { companyInterview: company._id } }
    );

    console.log("✅ Grid Dynamics assigned successfully");

  } catch (error) {
    console.error(error);
  }
};

const decreaseSuvenduSeat = async () => {
  try {
    const updated = await Professor.findOneAndUpdate(
      { idNumber: "00041" },
      { $inc: { "currentCount.summer_training": -1 } },
      { new: true }
    );

    if (!updated) {
      console.log("Professor not found");
      return;
    }

    console.log("Seat decreased successfully");
    console.log("Current Count:", updated.currentCount.summer_training);
    console.log("Limit:", updated.limits.summer_training);

  } catch (error) {
    console.error("Error decreasing seat:", error);
  }
};
// decreaseSuvenduSeat();
// assignLumberfi();
export { app };
