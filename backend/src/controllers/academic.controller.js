import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Academics } from "../models/academic.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a new academic record
const createAcademicRecord = asyncHandler(async (req, res) => {
    const { userId, semester, gpa } = req.body;
    if (!userId || !semester || !gpa) {
        throw new ApiError(400, "UserId, Semester, and GPA are required fields.");
    }
    try {
        let academicRecord = await Academics.findOne({ name: userId });

        if (!academicRecord) { // If no record exists, create a new one
            academicRecord = new Academics({
                name: userId,
                academicRecords: [], // Initialize the array
            });
        }

        academicRecord.academicRecords.push({ semester, gpa });
        await academicRecord.save();

        return res.status(201).json(
            new ApiResponse(201, academicRecord, "Academic record created successfully")
        );
    } catch (error) {
        console.error("Error creating academic record:", error);
        throw new ApiError(500, "Internal Server Error");
        return res.status(500).json(
            new ApiResponse(500, { success: false }, "Internal Server Error")
        );
    }
});

// Get academic records for the logged-in student
const getStudentAcademicRecords = asyncHandler(async (req, res) => {
    console.log("Fetching academic records for user:", req.user._id); // Add this log
    const userId = req.user._id;

    const userExists = await Academics.exists({ name: userId });
    if (!userExists) {
        return res.status(404).json(
            new ApiResponse(404, null, "User not found.")
        );
    }

    const academicRecords = await Academics.findOne({ name: userId }).select("-__v");

    return res.status(200).json(
        new ApiResponse(200, academicRecords, "Academic records retrieved successfully.")
    );
});

const getAdminAcademicRecords = asyncHandler(async (req, res) => {
  try {
    // Fetch all academic records and populate the necessary fields from the User model
    const records = await Academics.find().populate('name', 'fullName rollNumber branch section');

    console.log('Fetched Records:', records); // Debugging

    if (!records || records.length === 0) {
      return res.status(404).json(new ApiResponse(404, [], 'No academic records found.'));
    }

    // Filter out records with null name and format the records for the frontend
    const formattedRecords = records
      .filter(record => record.name !== null && typeof record.name === 'object')
      .map(record => {
        return record.academicRecords.map(academicRecord => ({
          userId: record.name._id,
          rollNumber: record.name.rollNumber,
          fullName: record.name.fullName,
          branch: record.name.branch,
          section: record.name.section,
          semester: academicRecord.semester,
          gpa: academicRecord.gpa,
        }));
      }).flat();

    console.log('Formatted Records:', formattedRecords); // Debugging

    return res.status(200).json(new ApiResponse(200, formattedRecords, 'Academic records fetched successfully.'));
  } catch (error) {
    console.error('Error fetching academic records:', error);
    return res.status(500).json(new ApiResponse(500, null, 'An error occurred while fetching academic records.'));
  }
});
  
export { 
    createAcademicRecord, 
    getStudentAcademicRecords,
    getAdminAcademicRecords
};





























// FOR REFERENCE IN FUTURE, JUST IN CASE: UPDATE AND DELETE FUNCTIONALITY

// Update academic records
// const updateAcademicRecords = asyncHandler(async (req, res) => {
//     const { semester, gpa } = req.body;
//     const userId = req.params.id;
  
//     if (!semester || !gpa) {
//       throw new ApiError(400, "Semester and GPA are required fields.");
//     }
  
//     const userExists = await Academics.exists({ name: userId });
//     if (!userExists) {
//       return res.status(404).json(
//         new ApiResponse(404, null, "User not found.")
//       );
//     }
  
//     const updatedAcademicRecord = await Academics.findOneAndUpdate(
//       { name: userId, "academicRecords.semester": semester },
//       { $set: { "academicRecords.$.gpa": gpa } },
//       { new: true }
//     ).select("-__v");
  
//     return res.status(200).json(
//       new ApiResponse(200, updatedAcademicRecord, "Academic record updated successfully.")
//     );
// });
  

// Delete an academic record
// const deleteAcademicRecord = asyncHandler(async (req, res) => {
//     const { semester } = req.body;
//     const userId = req.params.id;
  
//     console.log('Delete request received for userId:', userId, 'semester:', semester);
  
//     const userExists = await Academics.exists({ name: userId }); 
//     if (!userExists) {
//       console.error('User not found for userId:', userId);
//       return res.status(404).json(
//         new ApiResponse(404, null, "User not found.")
//       );
//     }
  
//     const recordExists = await Academics.exists({ name: userId, "academicRecords.semester": semester });
//     if (!recordExists) {
//       console.error('Academic record not found for userId:', userId, 'semester:', semester);
//       return res.status(404).json(
//         new ApiResponse(404, null, "Academic record not found.")
//       );
//     }
  
//     await Academics.findOneAndUpdate(
//       { name: userId },
//       { $pull: { academicRecords: { semester } } }
//     );
  
//     console.log('Academic record deleted for userId:', userId, 'semester:', semester);
//     return res.status(200).json(
//       new ApiResponse(200, null, "Academic record deleted successfully.")
//     );
// });

// router.route("/update/:id").patch(verifyJWT, updateAcademicRecords);
// router.route("/delete/:id").delete(verifyJWT, deleteAcademicRecord);