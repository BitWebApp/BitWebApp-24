import express from "express";
import {
  addNewProject, 
  getAllProjectsSummary, 
  getProjectDetails,
  editProject, 
  applyToProject, 
  getPendingApplications, 
  getAcceptedApplications, 
  getRejectedApplications, 
  updateApplicationStatus, 
  getStudentApplications,
  closeProject
} from "../controllers/profProject.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/apply", verifyJWT, applyToProject);  
router.get("/student/applications", verifyJWT, getStudentApplications); 
router.get("/projects/summary", verifyJWT, getAllProjectsSummary); 
router.get("/projects/:id", verifyJWT, getProjectDetails);

// admin routes
router.put("/projects/:id", verifyAdmin, editProject);
router.post("/projects", verifyAdmin, addNewProject);
router.get("/applications/pending", verifyAdmin, getPendingApplications);
router.get("/applications/accepted", verifyAdmin, getAcceptedApplications);
router.get("/applications/rejected", verifyAdmin, getRejectedApplications);
router.put("/applications/:applicationId", verifyAdmin, updateApplicationStatus);
router.put("/projects/:id/close", verifyAdmin, closeProject);

export default router;