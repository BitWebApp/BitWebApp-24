import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Project } from "../models/project.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const createProject = asyncHandler(async (req, res) => {
  const { projectName, domain, projectLink, techStack, guide } = req.body;
  const userId = req.user._id; // Assuming user_id is obtained from the JWT token
  console.log("User ID:", userId);

  // Input validation
  if (!projectName || !domain || !techStack || !guide || !projectLink) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if project already exists
  const existingProject = await Project.findOne({ projectName });
  if (existingProject) {
    await Project.findByIdAndUpdate(existingProject._id, {
      $addToSet: { contributors: userId },
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          existingProject,
          "Project already exists. Your contribution has been appended."
        )
      );
  }

  // Handle file upload to Cloudinary
  const projectLocalPath = req.files?.projectId?.[0]?.path;
  if (!projectLocalPath) {
    // console.error();
    throw new ApiError(400, "Project file is required");
  }
  const projectId = await uploadOnCloudinary(projectLocalPath);

  // Create new project
  const newProject = await Project.create({
    name: userId,
    projectName,
    domain,
    techStack,
    guide,
    projectLink,
    doc: projectId.url,
  });

  // Update project with user contribution
  await Project.findByIdAndUpdate(newProject._id, {
    $addToSet: { contributors: userId },
  });

  // Update user with project contribution
  await User.findByIdAndUpdate(userId, {
    $addToSet: { projects: newProject._id },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { newProject }, "Project created successfully"));
});

const ShowProject = asyncHandler(async (req, res) => {
  try {
    const showData = await Project.find().populate(
      "name",
      "rollNumber fullName"
    );
    console.log(showData);
    res
      .status(200)
      .json(new ApiResponse(200, showData, "Data shown successfully"));
  } catch (err) {
    console.error("Unable to fetch data", err);
    throw new ApiError(500, "Unable to fetch data");
  }
});

const deleteProject = asyncHandler(async (req, res) => {
  // const { id } = req.params;
  // const id=req.user;
  const userId = req.admin._id;
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    if (!project) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Project not found"));
    }

    const deletedDoc = project.doc;
    if (deletedDoc) {
      const publicId = deletedDoc.split("/").pop().split(".")[0];
      await deleteFromCloudinary(publicId);
    }

    await Project.findByIdAndDelete(id);

    res
      .status(200)
      .json(new ApiResponse(200, null, "Project deleted successfully"));
  } catch (err) {
    console.error("Error deleting project", err);
    throw new ApiError(500, "Error deleting project");
  }
});

const editProject = asyncHandler(async (req, res) => {
  // const { id } = req.params;
  // const id=req.user;
  const { _id: userId } = req.user;
  const { projectName, domain, projectLink, techStack, guide } = req.body;

  try {
    const project = await Project.findById(userId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // Handle file upload to Cloudinary if new file is provided
    let updatedDocUrl = project.doc;
    if (req.files?.projectId?.[0]?.path) {
      const projectLocalPath = req.files.projectId[0].path;

      // Delete the existing document from Cloudinary
      if (project.doc) {
        const publicId = project.doc.split("/").pop().split(".")[0];
        await deleteFromCloudinary(publicId);
      }

      // Upload the new document to Cloudinary
      const uploadedDoc = await uploadOnCloudinary(projectLocalPath);
      updatedDocUrl = uploadedDoc.url;
    }

    // Update the project with new data
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        projectName,
        domain,
        projectLink,
        techStack,
        guide,
        doc: updatedDocUrl,
      },
      { new: true }
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, updatedProject, "Project updated successfully")
      );
  } catch (err) {
    console.error("Error updating project", err);
    throw new ApiError(500, "Error updating project");
  }
});

const showProjectById = asyncHandler(async (req, res) => {
  // const {id}=req.params
  // const id=req.user
  const userId = req.admin._id;
  try {
    const FindProj = await User.findById(userId).populate("proj");

    if (!FindProj) {
      throw new ApiError(404, "some error in fetching data");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, FindProj.proj, "Project fetched successfully")
      );
  } catch (err) {
    console.log(err);
    throw new ApiError(501, "some error in fetch project by id");
  }
});

export {
  createProject,
  ShowProject,
  deleteProject,
  editProject,
  showProjectById,
};
