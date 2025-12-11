import { Professor } from "../models/professor.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Internship } from "../models/internship.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { nanoid, customAlphabet } from "nanoid";
import mongoose, { mongo } from "mongoose";
import { Group } from "../models/group.model.js";
import { Otp } from "../models/otp.model.js";
import { Review } from "../models/review.model.js";
import { Minor } from "../models/minor.model.js";
import { Major } from "../models/major.model.js";
const url = "http://139.167.188.221:3000/faculty-login";

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
  const professors = await Professor.find().select("-password");
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
  const reviewLog = await Review.findOne({ user: professor._id });
  let review = false;
  if (reviewLog) {
    review = true;
  }
  const options = {
    httpOnly: true,
    secure: false,
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
          review: review,
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

const generateAutoLoginUrl = asyncHandler(async (req, res) => {
  const { profId } = req.body;
  
  if (!profId) {
    throw new ApiError(400, "Professor ID is required!");
  }

  const professor = await Professor.findById(profId);
  if (!professor) {
    throw new ApiError(404, "Professor not found!");
  }

  // Generate access token for auto-login (valid for 30 minutes)
  const autoLoginToken = jwt.sign(
    { _id: professor._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30m" }
  );

  // Create the auto-login URL
  const autoLoginUrl = `http://139.167.188.221:3000/faculty-auto-login?token=${autoLoginToken}`;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { autoLoginUrl, autoLoginToken },
        "Auto-login URL generated successfully!"
      )
    );
});

// Auto-login with token from email link
const autoLoginProf = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "Auto-login token is required!");
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const professor = await Professor.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if (!professor) {
      throw new ApiError(404, "Professor not found!");
    }

    // Generate new access and refresh tokens for the session
    const { accessToken, refreshToken } = await generateAcessAndRefreshToken(
      professor._id
    );

    const reviewLog = await Review.findOne({ user: professor._id });
    let review = false;
    if (reviewLog) {
      review = true;
    }

    const options = {
      httpOnly: true,
      secure: false,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            professor: professor,
            review: review,
            accessToken,
            refreshToken,
          },
          "Professor auto-logged in successfully!"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired auto-login token!");
  }
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

const getAppliedGroups = asyncHandler(async (req, res) => {
  try {
    const profId = req.professor._id;

    // Fetch professor and populate appliedGroups.summer_training
    const professor = await Professor.findById(profId).populate({
      path: "appliedGroups.summer_training",
      populate: {
        path: "members org",
        select:
          "fullName rollNumber email linkedin codingProfiles cgpa section branch image companyName",
      },
    });

    if (!professor) {
      throw new ApiError(404, "Professor not found!");
    }

    const groups = professor.appliedGroups.summer_training || [];

    res
      .status(200)
      .json(
        new ApiResponse(200, groups, "Applied groups retrieved successfully!")
      );
  } catch (error) {
    console.error(error);
    throw new ApiError(
      500,
      "Something went wrong while getting applied groups!",
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

const denyGroup = asyncHandler(async (req, res) => {
  const { _id } = req.body;
  const profId = req?.professor?._id;
  const group = await Group.findById({ _id });
  if (!group) throw new ApiError(409, "Group not exists");
  group.summerAppliedProfs.pull(profId);
  const prof = await Professor.findById(profId);
  prof.appliedGroups.summer_training.pull(_id);
  group.deniedProf.push(profId);
  group.preferenceLastMovedAt = Date.now();
  await group.save();
  await prof.save();
  if (group.summerAppliedProfs.length > 0) {
    const profToApply = group.summerAppliedProfs[0];
    const prof = await Professor.findById({ _id: profToApply });
    prof.appliedGroups.summer_training.push(_id);
    await prof.save();
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Group denied and passed to next faculty in choice")
    );
});

// const acceptGroup = asyncHandler(async(req, res) => {
//   const {_id} = req.body;
//   const profId = req?.professor?._id
//   const prof = await Professor.findOne({_id: profId})
//   const group = await Group.findById({_id})
//   const numOfMem = group.members.length;
//   if(prof.currentCount.summer_training+numOfMem>prof.limits.summer_training) throw new ApiError(409, "Limit will exceed, you cannot accept above the limit.")
//   if(!group) throw new ApiError(409, "Group not exists")
//   group.summerAllocatedProf = profId;
//   group.summerAppliedProfs = [];
//   await group.save();
//   prof.currentCount.summer_training+=numOfMem;
//   prof.appliedGroups.summer_training.pull(group._id)
//   prof.students.summer_training.push(group._id)
//   await prof.save();
//   return res.status(200).json(new ApiResponse(200, "Group accepted"));
// })

const acceptGroup = asyncHandler(async (req, res) => {
  const { _id } = req.body;
  const profId = req?.professor?._id;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const prof = await Professor.findById(profId).session(session);
    const group = await Group.findById(_id).session(session);
    if (!prof) {
      throw new ApiError(404, "Professor not found");
    }
    if (!group) {
      throw new ApiError(404, "Group not found");
    }
    const numOfMem = group.members.length;
    if (
      prof.currentCount.summer_training + numOfMem >
      prof.limits.summer_training
    ) {
      throw new ApiError(
        409,
        "Limit will exceed, you cannot accept above the limit."
      );
    }
    group.summerAllocatedProf = profId;
    group.summerAppliedProfs = [];
    await group.save({ session });
    prof.currentCount.summer_training += numOfMem;
    prof.appliedGroups.summer_training.pull(group._id);
    prof.students.summer_training.push(group._id);
    await prof.save({ session });
    let internships;
    if (group.typeOfSummer === "research") {
      internships = group.members.map((studentId) => ({
        student: studentId,
        type: group.typeOfSummer,
        location: "inside_bit",
        mentor: profId,
      }));
    } else {
      internships = group.members.map((studentId) => ({
        student: studentId,
        type: group.typeOfSummer,
        location: "outside_bit",
        company: group.org,
        mentor: profId,
      }));
    }

    // const internships = group.members.map((studentId) => ({
    //   student: studentId,
    //   type: group.typeOfSummer,
    //   location:
    //     group.typeOfSummer === "research" ? "inside_bit" : "outside_bit",
    //   company: group.typeOfSummer === "industrial" ? group.org : null,
    //   mentor: profId,
    // }));
    await Internship.insertMany(internships, { session });
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json(new ApiResponse(200, "Group accepted"));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while accepting group",
      error.message
    );
  }
});

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
    })
    .populate({
      path: "org",
    });

  return res
    .status(200)
    .json(
      new ApiResponse(200, groups, "Accepted groups retrieved successfully!")
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
  return res
    .status(200)
    .json(new ApiResponse(200, "Remark added successfully!", group));
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

  absentees.forEach((absenteeId) => {
    if (!discussion.absent.includes(absenteeId)) {
      discussion.absent.push(absenteeId);
    }
  });

  await group.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Attendance updated successfully!", group));
});

const mergeGroups = asyncHandler(async (req, res) => {
  const { groupIds, rollNumber } = req.body;
  const profId = req?.professor?._id;

  if (!profId) {
    throw new ApiError(401, "Professor not authenticated");
  }

  const prof = await Professor.findById({ _id: profId });
  const groups = await Group.find({ _id: { $in: groupIds } });

  if (!groups || groups.length === 0) {
    throw new ApiError(404, "Groups not found");
  }

  const allGroupsAreResearch = groups.every(
    (group) => group.typeOfSummer === "research"
  );
  if (!allGroupsAreResearch) {
    throw new ApiError(403, "All groups must be of type research to be merged");
  }

  const isValidProf = groups.every(
    (group) => group.summerAllocatedProf?.toString() === profId.toString()
  );

  if (!isValidProf) {
    throw new ApiError(
      403,
      "Not all groups are allocated to the current professor"
    );
  }

  let allMembers = [];
  groups.forEach((group) => {
    allMembers = [...allMembers, ...group.members];
  });

  const uniqueMembers = Array.from(
    new Set(allMembers.map((m) => m.toString()))
  ).map((id) => allMembers.find((m) => m._id.toString() === id));

  const leader = uniqueMembers.find(
    (member) => member.rollNumber === rollNumber
  );

  if (!leader) {
    throw new ApiError(
      404,
      "Leader with given roll number not found in merged groups"
    );
  }

  await Group.deleteMany({ _id: { $in: groupIds } });

  const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
  const newGroup = new Group({
    groupId: nanoid(),
    leader: leader._id,
    type: "summer",
    typeOfSummer: "research",
    members: uniqueMembers,
    summerAppliedProfs: [],
    summerAllocatedProf: profId,
  });

  prof.students.summer_training = prof.students.summer_training.filter(
    (group) => !groupIds.includes(group.toString())
  );

  prof.students.summer_training.push(newGroup._id);

  await prof.save();
  await newGroup.save();

  // For each student in the merged groups, update their group field to the new group object id
  await Student.updateMany(
    { _id: { $in: uniqueMembers.map((member) => member._id) } },
    { $set: { group: newGroup._id } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Groups merged successfully!", newGroup));
});

const otpForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log(email);
  if (!email) {
    throw new ApiError(400, "email is req");
  }
  const prof = await Professor.findOne({ email: email.toLowerCase() });
  if (!prof) {
    throw new ApiError(404, "Professor does not exists");
  }
  const otp = `${Math.floor(Math.random() * 9000 + 1000)}`;
  await Otp.create({ email, otp });

  const tOtp = await Otp.findOne({ email });
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
    subject: "Forgot Password",
    html: `
        <html>
        <head>
          <style>
            .email-container {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 600px;
              margin: 0 auto;
              border: 1px solid #dddddd;
              border-radius: 5px;
              overflow: hidden;
            }
            .header {
              background-color: #007bff;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 24px;
            }
            .content {
              padding: 30px;
              background-color: #ffffff;
            }
            .content p {
              font-size: 18px;
              margin: 0 0 15px;
            }
            .otp {
              font-weight: bold;
              color: #007bff;
              font-size: 22px;
            }
            .footer {
              background-color: #f2f2f2;
              padding: 15px;
              text-align: center;
              font-size: 14px;
              color: #888888;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              OTP for Verification
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for choosing BITAcademia. To reset your password, please use the following One-Time Password (OTP):</p>
              <p class="otp">${tOtp.otp}</p>
              <p>If you did not request this OTP, please ignore this email or contact our support team.</p>
              <p>Best regards,</p>
              <p>TEAM BITACADEMIA</p>
            </div>
            <div class="footer">
              &copy; BITAcademia 2024. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
  };

  transporter.sendMail(mailOptions, async (error) => {
    if (error) {
      console.log("Error sending email to:", email, error);
    } else {
      console.log("Email sent to:", email);
    }
  });
  res.status(200).send("Mail sent!");
});

const changePassword = asyncHandler(async (req, res) => {
  try {
    const { email, otp, newpassword } = req.body;
    if (!email || !otp || !newpassword)
      throw new ApiError(400, "enter all fields");
    const prof = await Professor.findOne({ email });
    const otpverify = await Otp.find({
      email,
    });
    if (otpverify.length <= 0) {
      throw new ApiError(
        401,
        "Account record doesn't exist or has been verified already. please login"
      );
    }
    const hashedOTP = otpverify[0].otp;
    // console.log(hashedOTP)
    const validOTP = otp === hashedOTP;
    // console.log(validOTP)
    if (!validOTP) {
      throw new ApiError("Invalid code. Check your Inbox");
    } else {
      const savepass = await bcrypt.hash(newpassword, 12);
      const response = await Professor.updateOne(
        { _id: prof?._id },
        { $set: { password: savepass } }
      );
      await Otp.deleteMany({ email });
      return res.json({
        status: "Verified",
        message: "user email verified successfully",
        response,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: "Failed",
      message: error.message,
    });
  }
});
const getLimits = asyncHandler(async (req, res) => {
  const profid = req?.professor?._id;
  console.log(profid);
  const prof = await Professor.findById({ _id: profid });
  if (!prof) throw new ApiError(404, "Professor not found");
  const currentCount = prof.currentCount.summer_training;
  const totalCount = prof.limits.summer_training;
  const limitleft = totalCount - currentCount;
  return res
    .status(200)
    .json(new ApiResponse(200, limitleft, "limit returned"));
});

//************************************************************
const getMinorAppliedGroups = asyncHandler(async (req, res) => {
  try {
    const profId = req.professor._id;

    // Fetch professor and populate appliedGroups.minor_project
    const professor = await Professor.findById(profId).populate({
      path: "appliedGroups.minor_project",
      populate: {
        path: "members",
        select:
          "fullName rollNumber email linkedin codingProfiles cgpa section branch image companyName",
      },
    });

    if (!professor) {
      throw new ApiError(404, "Professor not found!");
    }
    // console.log(professor.appliedGroups);
    const groups = professor.appliedGroups.minor_project || [];

    res
      .status(200)
      .json(
        new ApiResponse(200, groups, "Applied groups retrieved successfully!")
      );
  } catch (error) {
    console.error(error);
    throw new ApiError(
      500,
      "Something went wrong while getting applied groups!",
      error.message
    );
  }
});

const selectMinorStudents = asyncHandler(async (req, res) => {
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
      professor.limits.minor_project - professor.currentCount.minor_project;
    if (selectedStudents.length > remainingCap) {
      throw new ApiError(
        400,
        `Cannot select more than ${remainingCap} students!`
      );
    }
    const students = await User.find({
      _id: { $in: selectedStudents },
      minorAppliedProfs: profId,
      isMinorAllocated: false,
    }).session(session);
    if (students.length !== selectedStudents.length) {
      throw new ApiError(400, "Invalid student ID's provided!");
    }
    for (const student of students) {
      student.isMinorAllocated = true;
      student.minorAllocatedProf = profId;
      student.minorAppliedProfs = student.minorAppliedProfs.filter(
        (id) => id.toString() !== profId.toString()
      );
      await student.save({ session });
    }
    professor.students.minor_project.push(...selectedStudents);
    professor.currentCount.minor_project += selectedStudents.length;
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

const getMinorAcceptedStudents = asyncHandler(async (req, res) => {
  const profId = req.professor._id;
  const professor = await Professor.findById(profId);
  if (!professor) {
    throw new ApiError(404, "Professor not found!");
  }
  const studentIds = professor.students.minor_project;
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

const denyMinorGroup = asyncHandler(async (req, res) => {
  const { _id } = req.body;
  const profId = req?.professor?._id;
  const group = await Minor.findById({ _id });
  if (!group) throw new ApiError(409, "Group not exists");
  group.minorAppliedProfs.pull(profId);
  const prof = await Professor.findById(profId);
  prof.appliedGroups.minor_project.pull(_id);
  group.deniedProf.push(profId);
  group.preferenceLastMovedAt = Date.now();
  await group.save();
  await prof.save();
  if (group.minorAppliedProfs.length > 0) {
    const profToApply = group.minorAppliedProfs[0];
    const prof = await Professor.findById({ _id: profToApply });
    prof.appliedGroups.minor_project.push(_id);
    await prof.save();
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Group denied and passed to next faculty in choice")
    );
});

const acceptMinorGroup = asyncHandler(async (req, res) => {
  const { _id } = req.body;
  const profId = req?.professor?._id;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const prof = await Professor.findById(profId).session(session);
    const group = await Minor.findById(_id).session(session);
    if (!prof) {
      throw new ApiError(404, "Professor not found");
    }
    if (!group) {
      throw new ApiError(404, "Group not found");
    }
    const numOfMem = group.members.length;
    if (
      prof.currentCount.minor_project + numOfMem >
      prof.limits.minor_project
    ) {
      throw new ApiError(
        409,
        "Limit will exceed, you cannot accept above the limit."
      );
    }
    group.minorAllocatedProf = profId;
    group.minorAppliedProfs = [];
    await group.save({ session });
    prof.currentCount.minor_project += numOfMem;
    prof.appliedGroups.minor_project.pull(group._id);
    prof.students.minor_project.push(group._id);
    await prof.save({ session });
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json(new ApiResponse(200, "Group accepted"));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while accepting group",
      error.message
    );
  }
});

const acceptedMinorGroups = asyncHandler(async (req, res) => {
  const profId = req?.professor?._id;
  const professor = await Professor.findById(profId);

  if (!professor) {
    throw new ApiError(404, "Professor not found!");
  }

  const groupIds = professor.students.minor_project;
  const groups = await Minor.find({ _id: { $in: groupIds } })
    .populate("leader")
    .populate("members")
    .populate("minorAppliedProfs")
    .populate("minorAllocatedProf")
    .populate("deniedProf")
    .populate({
      path: "discussion.absent",
    })
    .populate({
      path: "discussion.description",
    });
  return res
    .status(200)
    .json(
      new ApiResponse(200, groups, "Accepted groups retrieved successfully!")
    );
});

const addMinorRemark = asyncHandler(async (req, res) => {
  const { remark, _id, discussionId } = req.body;
  const group = await Minor.findById(_id);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }
  const discussion = group.discussion.id(discussionId);
  if (!discussion) {
    throw new ApiError(404, "Discussion entry not found");
  }
  discussion.remark = remark;
  await group.save();
  return res
    .status(200)
    .json(new ApiResponse(200, "Remark added successfully!", group));
});

const groupMinorAttendance = asyncHandler(async (req, res) => {
  const { absentees, _id, discussionId } = req.body;

  const group = await Minor.findById(_id);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const discussion = group.discussion.id(discussionId);
  if (!discussion) {
    throw new ApiError(404, "Discussion entry not found");
  }

  absentees.forEach((absenteeId) => {
    if (!discussion.absent.includes(absenteeId)) {
      discussion.absent.push(absenteeId);
    }
  });

  await group.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Attendance updated successfully!", group));
});

const mergeMinorGroups = asyncHandler(async (req, res) => {
  const { groupIds, rollNumber } = req.body;
  const profId = req?.professor?._id;

  if (!profId) {
    throw new ApiError(401, "Professor not authenticated");
  }

  const prof = await Professor.findById({ _id: profId });
  const groups = await Minor.find({ _id: { $in: groupIds } });

  if (!groups || groups.length === 0) {
    throw new ApiError(404, "Groups not found");
  }

  const isValidProf = groups.every(
    (group) => group.minorAllocatedProf?.toString() === profId.toString()
  );

  if (!isValidProf) {
    throw new ApiError(
      403,
      "Not all groups are allocated to the current professor"
    );
  }

  let allMembers = [];
  groups.forEach((group) => {
    allMembers = [...allMembers, ...group.members];
  });

  const uniqueMembers = Array.from(
    new Set(allMembers.map((m) => m.toString()))
  ).map((id) => allMembers.find((m) => m._id.toString() === id));

  const leader = uniqueMembers.find(
    (member) => member.rollNumber === rollNumber
  );

  if (!leader) {
    throw new ApiError(
      404,
      "Leader with given roll number not found in merged groups"
    );
  }

  await Minor.deleteMany({ _id: { $in: groupIds } });

  const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
  const newGroup = new Minor({
    groupId: nanoid(),
    leader: leader._id,
    members: uniqueMembers,
    minorAppliedProfs: [],
    minorAllocatedProf: profId,
  });

  prof.students.minor_project = prof.students.minor_project.filter(
    (group) => !groupIds.includes(group.toString())
  );

  prof.students.minor_project.push(newGroup._id);

  await prof.save();
  await newGroup.save();

  // For each student in the merged groups, update their group field to the new group object id
  await User.updateMany(
    { _id: { $in: uniqueMembers.map((member) => member._id) } },
    { $set: { MinorGroup: newGroup._id } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Groups merged successfully!", newGroup));
});

const getMinorLimits = asyncHandler(async (req, res) => {
  const profid = req?.professor?._id;
  console.log(profid);
  const prof = await Professor.findById({ _id: profid });
  if (!prof) throw new ApiError(404, "Professor not found");
  const currentCount = prof.currentCount.minor_project;
  const totalCount = prof.limits.minor_project;
  const limitleft = totalCount - currentCount;
  return res
    .status(200)
    .json(new ApiResponse(200, limitleft, "limit returned"));
});

const getMajorAppliedGroups = asyncHandler(async (req, res) => {
  try {
    const profId = req.professor._id;

    // Fetch professor and populate appliedGroups.major_project
    const professor = await Professor.findById(profId).populate({
      path: "appliedGroups.major_project",
      populate: [
        {
          path: "members",
          select:
            "fullName rollNumber email linkedin codingProfiles cgpa section branch image companyName",
        },
        {
          path: "org",
        }
      ],
    });

    if (!professor) {
      throw new ApiError(404, "Professor not found!");
    }
    const groups = professor.appliedGroups.major_project || [];

    res
      .status(200)
      .json(
        new ApiResponse(200, groups, "Applied groups retrieved successfully!")
      );
  } catch (error) {
    console.error(error);
    throw new ApiError(
      500,
      "Something went wrong while getting applied groups!",
      error.message
    );
  }
});

const selectMajorStudents = asyncHandler(async (req, res) => {
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
      professor.limits.major_project - professor.currentCount.major_project;
    if (selectedStudents.length > remainingCap) {
      throw new ApiError(
        400,
        `Cannot select more than ${remainingCap} students!`
      );
    }
    const students = await User.find({
      _id: { $in: selectedStudents },
      majorAppliedProfs: profId,
      isMajorAllocated: false,
    }).session(session);
    if (students.length !== selectedStudents.length) {
      throw new ApiError(400, "Invalid student ID's provided!");
    }
    for (const student of students) {
      student.isMajorAllocated = true;
      student.majorAllocatedProf = profId;
      student.majorAppliedProfs = student.majorAppliedProfs.filter(
        (id) => id.toString() !== profId.toString()
      );
      await student.save({ session });
    }
    professor.students.major_project.push(...selectedStudents);
    professor.currentCount.major_project += selectedStudents.length;
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

const getMajorAcceptedStudents = asyncHandler(async (req, res) => {
  const profId = req.professor._id;
  const professor = await Professor.findById(profId);
  if (!professor) {
    throw new ApiError(404, "Professor not found!");
  }
  const studentIds = professor.students.major_project;
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

const denyMajorGroup = asyncHandler(async (req, res) => {
  const { _id } = req.body;
  const profId = req?.professor?._id;
  const group = await Major.findById({ _id });
  if (!group) throw new ApiError(409, "Group not exists");
  group.majorAppliedProfs.pull(profId);
  const prof = await Professor.findById(profId);
  prof.appliedGroups.major_project.pull(_id);
  group.deniedProf.push(profId);
  group.preferenceLastMovedAt = Date.now();
  await group.save();
  await prof.save();
  if (group.majorAppliedProfs.length > 0) {
    const profToApply = group.majorAppliedProfs[0];
    const prof = await Professor.findById({ _id: profToApply });
    prof.appliedGroups.major_project.push(_id);
    await prof.save();
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Group denied and passed to next faculty in choice")
    );
});

const acceptMajorGroup = asyncHandler(async (req, res) => {
  const { _id } = req.body;
  const profId = req?.professor?._id;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const prof = await Professor.findById(profId).session(session);
    const group = await Major.findById(_id).session(session);
    if (!prof) {
      throw new ApiError(404, "Professor not found");
    }
    if (!group) {
      throw new ApiError(404, "Group not found");
    }
    const numOfMem = group.members.length;
    if (
      prof.currentCount.major_project + numOfMem >
      prof.limits.major_project
    ) {
      throw new ApiError(
        409,
        "Limit will exceed, you cannot accept above the limit."
      );
    }
    group.majorAllocatedProf = profId;
    group.majorAppliedProfs = [];
    await group.save({ session });
    prof.currentCount.major_project += numOfMem;
    prof.appliedGroups.major_project.pull(group._id);
    prof.students.major_project.push(group._id);
    await prof.save({ session });
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json(new ApiResponse(200, "Group accepted"));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while accepting group",
      error.message
    );
  }
});

const acceptedMajorGroups = asyncHandler(async (req, res) => {
  const profId = req?.professor?._id;
  const professor = await Professor.findById(profId);

  if (!professor) {
    throw new ApiError(404, "Professor not found!");
  }

  const groupIds = professor.students.major_project;
  const groups = await Major.find({ _id: { $in: groupIds } })
    .populate("leader")
    .populate("members")
    .populate("majorAppliedProfs")
    .populate("majorAllocatedProf")
    .populate("deniedProf")
    .populate("org")
    .populate({
      path: "discussion.absent",
    })
    .populate({
      path: "discussion.description",
    });
  return res
    .status(200)
    .json(
      new ApiResponse(200, groups, "Accepted groups retrieved successfully!")
    );
});

const addMajorRemark = asyncHandler(async (req, res) => {
  const { remark, _id, discussionId } = req.body;
  const group = await Major.findById(_id);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }
  const discussion = group.discussion.id(discussionId);
  if (!discussion) {
    throw new ApiError(404, "Discussion entry not found");
  }
  discussion.remark = remark;
  await group.save();
  return res
    .status(200)
    .json(new ApiResponse(200, "Remark added successfully!", group));
});

const groupMajorAttendance = asyncHandler(async (req, res) => {
  const { absentees, _id, discussionId } = req.body;

  const group = await Major.findById(_id);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const discussion = group.discussion.id(discussionId);
  if (!discussion) {
    throw new ApiError(404, "Discussion entry not found");
  }

  absentees.forEach((absenteeId) => {
    if (!discussion.absent.includes(absenteeId)) {
      discussion.absent.push(absenteeId);
    }
  });

  await group.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Attendance updated successfully!", group));
});

const mergeMajorGroups = asyncHandler(async (req, res) => {
  const { groupIds, rollNumber } = req.body;
  const profId = req?.professor?._id;

  if (!profId) {
    throw new ApiError(401, "Professor not authenticated");
  }

  const prof = await Professor.findById({ _id: profId });
  const groups = await Major.find({ _id: { $in: groupIds } });

  if (!groups || groups.length === 0) {
    throw new ApiError(404, "Groups not found");
  }

  const isValidProf = groups.every(
    (group) => group.majorAllocatedProf?.toString() === profId.toString()
  );

  if (!isValidProf) {
    throw new ApiError(
      403,
      "Not all groups are allocated to the current professor"
    );
  }

  let allMembers = [];
  groups.forEach((group) => {
    allMembers = [...allMembers, ...group.members];
  });

  const uniqueMembers = Array.from(
    new Set(allMembers.map((m) => m.toString()))
  ).map((id) => allMembers.find((m) => m._id.toString() === id));

  const leader = uniqueMembers.find(
    (member) => member.rollNumber === rollNumber
  );

  if (!leader) {
    throw new ApiError(
      404,
      "Leader with given roll number not found in merged groups"
    );
  }

  await Major.deleteMany({ _id: { $in: groupIds } });

  const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
  const newGroup = new Major({
    groupId: nanoid(),
    leader: leader._id,
    members: uniqueMembers,
    majorAppliedProfs: [],
    majorAllocatedProf: profId,
  });

  prof.students.major_project = prof.students.major_project.filter(
    (group) => !groupIds.includes(group.toString())
  );

  prof.students.major_project.push(newGroup._id);

  await prof.save();
  await newGroup.save();

  // For each student in the merged groups, update their group field to the new group object id
  await User.updateMany(
    { _id: { $in: uniqueMembers.map((member) => member._id) } },
    { $set: { MajorGroup: newGroup._id } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Groups merged successfully!", newGroup));
});

const getMajorLimits = asyncHandler(async (req, res) => {
  const profid = req?.professor?._id;
  console.log(profid);
  const prof = await Professor.findById({ _id: profid });
  if (!prof) throw new ApiError(404, "Professor not found");
  const currentCount = prof.currentCount.major_project;
  const totalCount = prof.limits.major_project;
  const limitleft = totalCount - currentCount;
  return res
    .status(200)
    .json(new ApiResponse(200, limitleft, "limit returned"));
});

const getPendingTypeChangeRequests = asyncHandler(async (req, res) => {
  const professorId = req?.professor?._id;

  if (!professorId) {
    return res.status(401).json({
      success: false,
      message: "Professor not authenticated",
    });
  }

  // Find all major groups allocated to this professor with pending type change requests
  const groupsWithRequests = await Major.find({
    majorAllocatedProf: professorId,
    "typeChangeRequests.status": "pending",
  })
    .populate("members leader typeChangeRequests.user typeChangeRequests.org majorAllocatedProf")
    .lean();

  // Filter to only include pending requests
  const groupsWithPendingRequests = groupsWithRequests.map((group) => ({
    ...group,
    typeChangeRequests: group.typeChangeRequests.filter((req) => req.status === "pending"),
  })).filter((group) => group.typeChangeRequests.length > 0);

  return res.status(200).json(
    new ApiResponse(200, groupsWithPendingRequests, "Pending type change requests fetched successfully")
  );
});

export {
  selectMinorStudents,
  getMinorLimits,
  denyMinorGroup,
  getMinorAppliedGroups,
  addMinorRemark,
  groupMinorAttendance,
  getMinorAcceptedStudents,
  acceptMinorGroup,
  mergeMinorGroups,
  acceptedMinorGroups,
  // Major project functions
  selectMajorStudents,
  getMajorLimits,
  denyMajorGroup,
  getMajorAppliedGroups,
  addMajorRemark,
  groupMajorAttendance,
  getMajorAcceptedStudents,
  acceptMajorGroup,
  mergeMajorGroups,
  acceptedMajorGroups,
  getPendingTypeChangeRequests,
  // Other existing functions
  addProf,
  getProf,
  loginProf,
  logoutProf,
  generateAutoLoginUrl,
  autoLoginProf,
  getLimits,
  applyToSummer,
  getAppliedGroups,
  selectSummerStudents,
  getcurrentProf,
  incrementLimit,
  getAcceptedStudents,
  denyGroup,
  acceptGroup,
  addRemark,
  groupAttendance,
  acceptedGroups,
  mergeGroups,
  otpForgotPassword,
  changePassword,
};
