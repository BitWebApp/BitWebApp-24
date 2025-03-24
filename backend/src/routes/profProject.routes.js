import express from "express";
import {
  addNewProject, 
  getAllProjectsSummary, 
  getProjectDetails,
  editProject, 
  applyToProject, 
  getAllApplications,
  updateApplicationStatus, 
  getStudentApplications,
  closeProject,
  getApplicationDetails
} from "../controllers/profProject.controller.js";
import { verifyJWT, verifyProfessor } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/apply", verifyJWT, upload.array('files'), applyToProject);
router.get("/student/applications", verifyJWT, getStudentApplications);

//both for prof and students
router.get(
  "/projects/summary",
  async (req, res, next) => {
    let jwtPassed = false;
    let adminPassed = false;

    // Run verifyJWT
    await new Promise((resolve) => {
      verifyJWT(req, res, (err) => {
        if (!err) jwtPassed = true;
        resolve();
      });
    });

    // Run verifyProfessor
    await new Promise((resolve) => {
      verifyProfessor(req, res, (err) => {
        if (!err) adminPassed = true;
        resolve();
      });
    });

    // Check if both failed
    if (!jwtPassed && !adminPassed) {
      return res.status(403).json({
        message: "Authentication and Authorization both failed.",
      });
    }

    // Continue to the next middleware
    next();
  },
  getAllProjectsSummary
);

router.get(
  "/projects/:id",
  async (req, res, next) => {
    let jwtPassed = false;
    let adminPassed = false;

    // Run verifyJWT
    await new Promise((resolve) => {
      verifyJWT(req, res, (err) => {
        if (!err) jwtPassed = true;
        resolve();
      });
    });

    // Run verifyProfessor
    await new Promise((resolve) => {
      verifyProfessor(req, res, (err) => {
        if (!err) adminPassed = true;
        resolve();
      });
    });

    // Check if both failed
    if (!jwtPassed && !adminPassed) {
      return res.status(403).json({
        message: "Authentication and Authorization both failed.",
      });
    }

    // Continue to the next middleware
    next();
  },
  getProjectDetails
);

// prof routes
router.post("/projects", verifyProfessor, upload.array('files'), addNewProject);
router.get("/applications/status/:status", verifyProfessor,getAllApplications);
router.get("/applications/:applicationId", verifyProfessor, getApplicationDetails);
router.put("/projects/close/:id", verifyProfessor, closeProject);
router.put("/projects/:id", verifyProfessor, upload.array('files'), editProject);
router.put("/applications/:applicationId", verifyProfessor, updateApplicationStatus);

export default router;