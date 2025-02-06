import { Professor } from "../models/professor.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Internship } from "../models/internship.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import {nanoid, customAlphabet} from "nanoid"
import mongoose, { mongo } from "mongoose";
import {Group} from "../models/group.model.js"
const url = "https://bitacademia.vercel.app/faculty-login";

const addProf = asyncHandler(async (req, res) => {
  const { idNumber, fullName, contact, email } = req.body;
  if (!idNumber || !fullName || !contact || !email) {
    throw new ApiError(
      400,
      "All fields (idNumber, fullName, contact, email) are required!"
    );
  }
  const existingProfessor = await Professor.findOne({ idNumber });
  const existingEmail = await Professor.findOne({ email });
  if (existingEmail) {
    throw new ApiError(409, "Professor with this email already exists!");
  }
  if (existingProfessor) {
    throw new ApiError(409, "Professor with this ID number already exists!");
  }
  const password = crypto.randomInt(100000, 1000000).toString();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Your Account Password",
    html: `
      <body>
        <h2>Welcome to BITAcademia!</h2>
        <p>Your account has been created. Below are your credentials:</p>
        <p>Email: <strong>${email}</strong></p>
        <p>Password: <strong>${password}</strong></p>
        <p>Click <a href="${url}">here</a> to login.</p>
        <p>If you did not request this account, please contact our support team.</p>
        <footer>
          <p>&copy; BITAcademia 2024. All rights reserved.</p>
        </footer>
      </body>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent to:", email);
  } catch (error) {
    console.error("Error sending email to:", email, error.message);
    return res
      .status(500)
      .json(new ApiError(500, `Error sending email to: ${email}`));
  }

  const professor = await Professor.create({
    idNumber,
    fullName,
    contact,
    email,
    password: password,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Professor added successfully!", professor));
});
// const addProf = asyncHandler(async (req, res) => {
//   const professors = req.body;

//   if (!Array.isArray(professors) || professors.length === 0) {
//     throw new ApiError(400, "An array of professor objects is required!");
//   }

//   const errors = [];
//   const addedProfessors = [];

//   for (const professorData of professors) {
//     const { idNumber, fullName, contact, email } = professorData;

//     if (!idNumber || !fullName || !contact || !email) {
//       errors.push({
//         professorData,
//         error: "All fields (idNumber, fullName, contact, email) are required!",
//       });
//       continue;
//     }

//     try {
//       const existingProfessor = await Professor.findOne({ idNumber });
//       const existingEmail = await Professor.findOne({ email });

//       if (existingEmail) {
//         errors.push({
//           professorData,
//           error: "Professor with this email already exists!",
//         });
//         continue;
//       }

//       if (existingProfessor) {
//         errors.push({
//           professorData,
//           error: "Professor with this ID number already exists!",
//         });
//         continue;
//       }

//       const password = crypto.randomInt(100000, 1000000).toString();
//       const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.AUTH_EMAIL,
//           pass: process.env.AUTH_PASSWORD,
//         },
//       });

//       const mailOptions = {
//         from: process.env.AUTH_EMAIL,
//         to: email,
//         subject: "Welcome to BITAcademia! Your Account Credentials",
//         html: `
//         <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
//           <table width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); overflow: hidden;">
//             <thead style="background-color: #0033cc; color: #ffffff; text-align: center;">
//               <tr>
//                 <th style="padding: 20px;">
//                   <h1 style="margin: 0; font-size: 24px;">Welcome to BITAcademia!</h1>
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td style="padding: 20px; text-align: left;">
//                   <p style="font-size: 16px; color: #333333;">Dear Professor,</p>
//                   <p style="font-size: 16px; color: #333333;">Your account has been successfully created on BITAcademia. Below are your login credentials:</p>
//                   <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
//                     <tr>
//                       <td style="font-weight: bold; color: #333333; padding: 8px; border: 1px solid #ddd;">Email:</td>
//                       <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
//                     </tr>
//                     <tr>
//                       <td style="font-weight: bold; color: #333333; padding: 8px; border: 1px solid #ddd;">Password:</td>
//                       <td style="padding: 8px; border: 1px solid #ddd;">${password}</td>
//                     </tr>
//                   </table>
//                   <p style="font-size: 16px; color: #333333;">You can log in by clicking the button below:</p>
//                   <p style="text-align: center; margin: 20px 0;">
//                     <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #0033cc; color: #ffffff; text-decoration: none; font-size: 16px; border-radius: 5px;">Login to BITAcademia</a>
//                   </p>
//                   <p style="font-size: 16px; color: #333333;">If you did not request this account or have any concerns, please contact our support team immediately.</p>
//                 </td>
//               </tr>
//             </tbody>
//             <tfoot style="background-color: #0033cc; color: #ffffff; text-align: center;">
//               <tr>
//                 <td style="padding: 10px;">
//                   <p style="margin: 0; font-size: 14px;">&copy; BITAcademia 2024. All rights reserved.</p>
//                 </td>
//               </tr>
//             </tfoot>
//           </table>
//         </body>
//         `,
//       };
      
//       await transporter.sendMail(mailOptions);

//       const newProfessor = await Professor.create({
//         idNumber,
//         fullName,
//         contact,
//         email,
//         password,
//       });

//       addedProfessors.push(newProfessor);
//     } catch (error) {
//       errors.push({
//         professorData,
//         error: error.message,
//       });
//     }
//   }

//   res.status(201).json({
//     message: "Bulk professor processing completed!",
//     addedProfessors,
//     errors,
//   });
// });

const getProf = asyncHandler(async (req, res) => {
  const professors = await Professor.find();
  res
    .status(200)
    .json(
      new ApiResponse(200, "Professors retrieved successfully!", professors)
    );
});

const generateAcessAndRefreshToken = async (profId) => {
  try {
    const prof = await Professor.findById(profId);
    const accessToken = prof.generateAccessToken();
    const refreshToken = prof.generateRefreshToken();
    prof.refreshToken = refreshToken;
    await prof.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and acess token!"
    );
  }
};
const loginProf = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required!");
  }
  const professor = await Professor.findOne({ email });
  if (!professor) {
    throw new ApiError(404, "Professor not found!");
  }
  const isPasswordValid = await professor.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password!");
  }
  const { accessToken, refreshToken } = await generateAcessAndRefreshToken(
    professor._id
  );
  const loggedInProfessor = await Professor.findById(professor._id).select(
    "-password -refeshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          professor: loggedInProfessor,
          accessToken,
          refreshToken,
        },
        "User loggedIn successfully!"
      )
    );
});
const logoutProf = asyncHandler(async (req, res) => {
  await Professor.findByIdAndUpdate(
    req.professor._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Prof logged out successfully!"));
});

//***************************************************/
const applyToSummer = asyncHandler(async (req, res) => {
  const { profIds } = req.body; // Expecting an array of professor IDs

  if (!Array.isArray(profIds) || profIds.length === 0) {
    throw new ApiError(400, "No professor IDs provided or invalid format!");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  if (user.isSummerAllocated) {
    throw new ApiError(400, "You have already been allocated a professor!");
  }

  const appliedProfIds = [];
  const errors = [];

  for (const profId of profIds) {
    try {
      const prof = await Professor.findById(profId);

      if (!prof) {
        errors.push(`Professor with ID ${profId} not found!`);
        continue;
      }

      if (user.summerAppliedProfs.includes(profId)) {
        errors.push(`You have already applied to professor with ID ${profId}!`);
        continue;
      }

      user.summerAppliedProfs.push(profId);
      appliedProfIds.push(profId);
    } catch (error) {
      errors.push(
        `Error processing professor with ID ${profId}: ${error.message}`
      );
    }
  }

  await user.save();

  const responseMessage = {
    appliedProfessors: appliedProfIds,
    errors,
    message: appliedProfIds.length
      ? `Successfully applied to ${appliedProfIds.length} professor(s).`
      : "No applications were successful.",
  };

  res
    .status(appliedProfIds.length ? 200 : 400)
    .json(new ApiResponse(200, responseMessage.message, responseMessage));
});

//*************************************************************** */
const getAppliedStudents = asyncHandler(async (req, res) => {
  try {
    const profId = req.professor._id;
    const professor = await Professor.findById(profId);
    if (!professor) {
      throw new ApiError(404, "Professor not found!");
    }
    const students = await User.find({
      summerAppliedProfs: profId,
      isSummerAllocated: false,
    });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Applied students retrieved successfully!",
          students
        )
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while getting applied students!",
      error.message
    );
  }
});

const selectSummerStudents = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const profId = req.professor._id;
    const { selectedStudents } = req.body;
    const professor = await Professor.findById(profId).session(session);
    if (!professor) {
      throw new ApiError(404, "Professor not found!");
    }
    const remainingCap =
      professor.limits.summer_training - professor.currentCount.summer_training;
    if (selectedStudents.length > remainingCap) {
      throw new ApiError(
        400,
        `Cannot select more than ${remainingCap} students!`
      );
    }
    const students = await User.find({
      _id: { $in: selectedStudents },
      summerAppliedProfs: profId,
      isSummerAllocated: false,
    }).session(session);
    if (students.length !== selectedStudents.length) {
      throw new ApiError(400, "Invalid student ID's provided!");
    }
    for (const student of students) {
      // console.log(student);
      student.isSummerAllocated = true;
      student.summerAllocatedProf = profId;
      // console.log("check!");
      student.summerAppliedProfs = student.summerAppliedProfs.filter(
        (id) => id.toString() !== profId.toString()
      );
      await student.save({ session });
      // console.log("check2!");
      const internRecord = await Internship.create(
        [
          {
            student: student._id,
            type: "research",
            location: "inside_bit",
            mentor: profId,
            startDate: new Date(),
            endDate: new Date(),
          },
        ],
        { session }
      );
      // console.log("check3!");
      if (!internRecord) {
        throw new ApiError(500, "Failed to create internship record!");
      }
    }
    professor.students.summer_training.push(...selectedStudents);
    professor.currentCount.summer_training += selectedStudents.length;
    await professor.save({ session });
    await session.commitTransaction();
    res
      .status(200)
      .json(new ApiResponse(200, "Students selected successfully!", students));
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while selecting students!",
      error.message
    );
  } finally {
    session.endSession();
  }
});

const getcurrentProf = asyncHandler(async (req, res) => {
  const profId = req.professor._id;
  const professor = await Professor.findById(profId);
  if (!professor) {
    throw new ApiError(404, "Professor not found!");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Professor retrieved successfully!", professor));
});

const incrementLimit = asyncHandler(async (req, res) => {
  const { profId, limit, type } = req.body;
  const professor = await Professor.findById(profId);
  if (!professor) {
    throw new ApiError(404, "Professor not found!");
  }
  if (!limit || !type) {
    throw new ApiError(400, "Limit and field are required!");
  }
  if (type == "summer_training") {
    if (limit < professor.currentCount.summer_training) {
      throw new ApiError(400, "Limit cannot be less than current count!");
    }
    professor.limits.summer_training = limit;
    await professor.save();
  } else if (type == "minor_project") {
    if (limit < professor.currentCount.minor_project) {
      throw new ApiError(400, "Limit cannot be less than current count!");
    }
    professor.limits.minor_project = limit;
    await professor.save();
  } else if (type == "major_project") {
    if (limit < professor.currentCount.major_project) {
      throw new ApiError(400, "Limit cannot be less than current count!");
    }
    professor.limits.major_project = limit;
    await professor.save();
  } else {
    throw new ApiError(400, "Invalid type provided!");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Limit updated successfully!", professor));
});

const getAcceptedStudents = asyncHandler(async (req, res) => {
  const profId = req.professor._id;
  const professor = await Professor.findById(profId);
  if (!professor) {
    throw new ApiError(404, "Professor not found!");
  }
  const studentIds = professor.students.summer_training;
  const students = await User.find({
    _id: { $in: studentIds },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Accepted students retrieved successfully!",
        students
      )
    );
});

const denyGroup = asyncHandler(async(req, res) => {
  const {_id} = req.body;
  const profId = req?.professor?._id
  const group = await Group.findById({_id})
  if(!group) throw new ApiError(409, "Group not exists")
  group.summerAppliedProfs.pull(profId)
  group.deniedProf.push(profId)
  await group.save();
  if(group.summerAppliedProfs.length>0){
    const profToApply = group.summerAppliedProfs[0];
    const prof = await Professor.findById({_id: profToApply})
    prof.students.summer_training.push(_id)
    await prof.save();
  }
  return res.status(200).json(new ApiResponse(200, "Group denied and passed to next faculty in choice"));
})

const acceptGroup = asyncHandler(async(req, res) => {
  const {_id} = req.body;
  const profId = req?.professor?._id
  const prof = await Professor.findOne({_id: profId})
  const numOfMem = group.members.length;
  if(prof.currentCount.summer_training+numOfMem>prof.limits.summer_training) throw new ApiError(409, "Limit will exceed, you cannot accept above the limit.")
  const group = await Group.findById({_id})
  if(!group) throw new ApiError(409, "Group not exists")
  group.summerAllocatedProf = profId;
  group.summerAppliedProfs = [];
  await group.save();
  prof.currentCount.summer_training+=numOfMem;
  await prof.save();
  return res.status(200).json(new ApiResponse(200, "Group accepted"));
})

const acceptedGroups = asyncHandler(async (req, res) => {
  const profId = req?.professor?._id;
  const professor = await Professor.findById(profId);
  
  if (!professor) {
    throw new ApiError(404, "Professor not found!");
  }

  const groupIds = professor.students.summer_training;
  const groups = await Group.find({ _id: { $in: groupIds } })
    .populate("leader") 
    .populate("members")
    .populate("summerAppliedProfs") 
    .populate("summerAllocatedProf") 
    .populate("deniedProf") 
    .populate({
      path: "discussion.absent",
    })
    .populate({
      path: "discussion.description", 
    });

  return res.status(200).json(
    new ApiResponse(200, "Accepted groups retrieved successfully!", groups)
  );
});


const addRemark = asyncHandler(async (req, res) => {
  const { remark, _id, discussionId } = req.body;
  const group = await Group.findById(_id);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }
  const discussion = group.discussion.id(discussionId);
  if (!discussion) {
    throw new ApiError(404, "Discussion entry not found");
  }
  discussion.remark = remark;
  await group.save();
  return res.status(200).json(
    new ApiResponse(200, "Remark added successfully!", group)
  );
});

const groupAttendance = asyncHandler(async (req, res) => {
  const { absentees, _id, discussionId } = req.body;

  const group = await Group.findById(_id);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const discussion = group.discussion.id(discussionId);
  if (!discussion) {
    throw new ApiError(404, "Discussion entry not found");
  }

  absentees.forEach(absenteeId => {
    if (!discussion.absent.includes(absenteeId)) {
      discussion.absent.push(absenteeId);
    }
  });

  await group.save();

  return res.status(200).json(
    new ApiResponse(200, "Attendance updated successfully!", group)
  );
});

const mergeGroups = asyncHandler(async (req, res) => {
  const { groupIds, rollNumber } = req.body;
  const profId = req?.professor?._id; 
  if (!profId) {
    throw new ApiError(401, "Professor not authenticated");
  }

  const groups = await Group.find({ _id: { $in: groupIds } });
  if (!groups || groups.length === 0) {
    throw new ApiError(404, "Groups not found");
  }

  const isValidProf = groups.every(group => group.summerAllocatedProf?.toString() === profId.toString());
  if (!isValidProf) {
    throw new ApiError(403, "Not all groups are allocated to the current professor");
  }

  let allMembers = [];
  groups.forEach(group => {
    allMembers = [...allMembers, ...group.members];
  });

  const leader = allMembers.find(member => member.rollNumber === rollNumber);
  if (!leader) {
    throw new ApiError(404, "Leader with given roll number not found in merged groups");
  }

  await Group.deleteMany({ _id: { $in: groupIds } });

  const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);
  const newGroup = new Group({
    groupId: nanoid(), 
    leader: leader._id,
    members: allMembers,
    summerAppliedProfs: [],
    summerAllocatedProf: profId, 
  });

  
  await newGroup.save();
  return res.status(200).json(
    new ApiResponse(200, "Groups merged successfully!", newGroup)
  );
});



export {
  addProf,
  getProf,
  loginProf,
  logoutProf,
  applyToSummer,
  getAppliedStudents,
  selectSummerStudents,
  getcurrentProf,
  incrementLimit,
  getAcceptedStudents,
  denyGroup,
  acceptGroup,
  addRemark,
  groupAttendance,
  acceptedGroups,
  mergeGroups
};
