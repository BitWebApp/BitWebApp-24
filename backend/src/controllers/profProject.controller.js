import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { AdhocProject } from "../models/profProject.model.js";
import { RequestProj } from "../models/requestProj.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/Cloudinary.js";
import { Professor } from "../models/professor.model.js";

const addNewProject = asyncHandler(async (req, res) => {
  const { profId, title, desc, categories, startDate, endDate, relevantLinks } = req.body;
  const professor = await Professor.findById(profId);
  if (!professor) {
    throw new ApiError(404, "Professor not found!");
  }

  const docsURL = [];
  if (req.files && req.files.length) {
    for (const file of req.files) {
      const cloudinaryResponse = await uploadOnCloudinary(file.path);
      docsURL.push(cloudinaryResponse.secure_url);
    }
  }

  const newProject = await AdhocProject.create({
    professor: profId,
    title,
    desc,
    categories,
    startDate,
    endDate,
    doc: docsURL,
    relevantLinks
  });

  res.status(201).json({ 
    success: true, 
    data: newProject 
  });
});

const getAllProjectsSummary = asyncHandler(async (req, res) => {
    const projects = await AdhocProject.find().select('title startDate endDate closed');
    res.status(200).json({ success: true, data: projects });
});

const getProjectDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const project = await AdhocProject.findById(id)
      .populate({ path: "professor", select: "fullName email" });
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    const projectData = project.toObject();
    projectData.profName = project.professor.fullName;
    projectData.profEmail = project.professor.email;
    res.status(200).json({ success: true, data: projectData });
});

const editProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, desc, categories, startDate, endDate, relevantLinks, deleteUrls, closed } = req.body; // 'relevantLinks' is now an array
  
    try {
      const project = await AdhocProject.findById(id);
  
      if (!project) {
        throw new ApiError(404, "Project not found");
      }
  
      project.title = title || project.title;
      project.desc = desc || project.desc;
      project.categories = categories || project.categories;
      project.startDate = startDate || project.startDate;
      project.endDate = endDate || project.endDate;
      project.relevantLinks = relevantLinks || project.relevantLinks; // Assign array directly
      project.closed = closed !== undefined ? closed : project.closed; // Ensure 'closed' is updated correctly
  
      if (deleteUrls && Array.isArray(deleteUrls) && deleteUrls.length > 0) {
        for (const url of deleteUrls) {
          try {
            const publicId = url.split("/").pop().split(".")[0];
            await deleteFromCloudinary(publicId);
          } catch (error) {
            console.error("Error deleting file from Cloudinary:", error);
          }
        }
  
        project.doc = project.doc.filter(docUrl => !deleteUrls.includes(docUrl));
      }
  
      const newDocsURL = [];
      if (req.files && req.files.length) {
        for (const file of req.files) {
          try {
            const cloudinaryResponse = await uploadOnCloudinary(file.path);
            console.log("Uploaded file to Cloudinary:", cloudinaryResponse);
            newDocsURL.push(cloudinaryResponse.secure_url);
          } catch (error) {
            console.error("Error uploading file to Cloudinary:", error);
            throw new Error("Failed to upload file to Cloudinary");
          }
        }
      }
  
      if (newDocsURL.length > 0) {
        project.doc = [...project.doc, ...newDocsURL];
      }
  
      await project.save();
  
      res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Internal server error" });
    }
});
const applyToProject = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  
  // Check if the project exists
  const project = await AdhocProject.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  
  // Check if the project is closed
  if (project.closed) {
    throw new ApiError(400, "This project is closed and no longer accepting applications");
  }
  
  // Check if the student has already applied for this project
  const existingApplication = await RequestProj.findOne({
    projectId,
    studentId: req.user._id
  });

  if (existingApplication) {
    throw new ApiError(400, "You have already applied to this project");
  }

  // Process uploaded files
  const docsURL = [];
  if (req.files && req.files.length) {
    for (const file of req.files) {
      const cloudinaryResponse = await uploadOnCloudinary(file.path);
      docsURL.push(cloudinaryResponse.secure_url);
    }
  }

  // Create a new application
  const request = await RequestProj.create({
    projectId, studentId: req.user._id, doc: docsURL
  });

  res.status(201).json({
    success: true,
    data: request
  });
});


const getAllApplications = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const applications = await RequestProj.find({ status })
    .populate('studentId', 'fullName email rollNumber mobileNumber')
    .populate('projectId', 'title profName') // Added populate for projectId
    .select('status applicationDate doc projectId'); // Included projectId in selected fields
  console.log("applications", applications);
  res.status(200).json({ success: true, data: applications });
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { applicationId } = req.params; 
    const { status } = req.body;
  
    if (!["accepted", "rejected"].includes(status)) {
      throw new ApiError(400, "Invalid status value. Allowed values are 'accepted', or 'rejected'.");
    }

    const updatedApplication = await RequestProj.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }  
    );
  
    if (!updatedApplication) {
      throw new ApiError(404, "Application not found");
    }
    res.status(200).json({ success: true, data: updatedApplication });
});

const getStudentApplications = asyncHandler(async (req, res) => {
  try {
    const studentId = req.user._id; 
    const { projId } = req.query;

    const application = await RequestProj.findOne({ studentId, projectId: projId }).select('status');
    if (!application) {
      return res.status(200).json({ success: true, data: "notapplied" });
    }

    res.status(200).json({ success: true, data: application.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const closeProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const project = await AdhocProject.findById(id);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }
  
    project.closed = true;
    await project.save();
  
    res.status(200).json({ 
      success: true, 
      message: "Project marked as closed" 
    });
});

const getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await RequestProj.findById(applicationId)
      .populate('studentId', 'fullName email')
      .populate('projectId', 'title profName startDate endDate');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ data: application });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching application details' });
  }
};

export { 
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
};