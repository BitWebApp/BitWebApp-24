import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import academicsRouter from "./routes/academic.routes.js"
app.use("/api/v1/academics", academicsRouter);

import examRouter from "./routes/exam.routes.js";
import higherEducationRouter from "./routes/higher-education.routes.js";
import projectRouter from "./routes/project.routes.js"
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/exam", examRouter);
app.use("/api/v1/higher-education", higherEducationRouter);


import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);

export { app };
