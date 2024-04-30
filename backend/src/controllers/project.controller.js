
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Project } from "../models/project.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { User } from "../models/user.model.js";

const createProject = asyncHandler(async (req, res) => {
  const { projectName, domain, projectLink, techStack, guide } = req.body;
  const {_id: userid } = req.user; // Assuming user_id is obtained from the JWT token
  console.log("user is ",userid);
  // Input validation
  if (!projectName || !domain || !techStack || !guide || !projectLink) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if project already exists if yes then append kr do apna contribution :)
  const existingProject = await Project.findOne({ projectName });
  if (existingProject) {
    
    await Project.findByIdAndUpdate(existingProject._id, {
      $addToSet: { name: userid },
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        existingProject,
        "Project already exists. Your contribution has been appended."
      )
    );
  }

  
  const projectLocalPath = req.files?.projectId[0]?.path;
  if (!projectLocalPath) {
    throw new ApiError(400, "Project file is required");
  }
  const projectId = await uploadOnCloudinary(projectLocalPath);

  
  const newProject = await Project.create({
    projectName,
    domain,
    techStack,
    guide,
    projectLink,
    doc: projectId.url,
  });

  await Project.findByIdAndUpdate(newProject._id,{
    $addToSet:{name:userid}
  })

  const findUser=await User.findById(userid);

  await User.findByIdAndUpdate(findUser._id,{
    $addToSet:{proj:newProject._id}
  })

  return res.status(201).json(
    new ApiResponse(201, {newProject,findUser}, "Project created successfully")
  );
});

const ShowProject=asyncHandler(async(req,res)=>{
    const showData=await Project.find();

    res.status(200).json(
        new ApiResponse(
            200,
            showData,
            "data shown succesfully"
        )
    )
})

export { createProject,ShowProject };

    
