import { PeCourse } from '../models/peCourse.model.js';
import { User } from '../models/user.model.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const addPeCourse = async (req, res) => {
  try {
    const { peCourseId } = req.body;
    const userId = req.user._id;
    const course = await PeCourse.findOne({ courseCode: peCourseId.toString() });

    if (!course) {
      return res.status(404).json({ success: false, message: 'PE Course not found!' });
    }
    const user = await User.findById(userId);
    if (user.branch !== course.branch) {
      return res.status(400).json({ success: false, message: 'You cannot select a PE course from a different branch.' });
    }
    const isStudentAlreadyEnrolled = user.peCourses?.includes(peCourseId.toString());
    if (isStudentAlreadyEnrolled) {
      return res.status(400).json({ success: false, message: 'You have already selected a PE course.' });
    }
    course.students.push(userId);
    await course.save();

    await User.findByIdAndUpdate(userId, {
      $push: { peCourses: course._id },
    });

    res.status(200).json({ success: true, message: 'PE course added successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error, try again later.' });
  }
};

export const getAdminPeCourses = asyncHandler(async (req, res) => {
  try {
    // Fetch all PE courses and populate the necessary student details from the User model
    const courses = await PeCourse.find().populate('students', 'fullName rollNumber branch section');

    // console.log('Fetched PE Courses:', courses); // Debugging

    if (!courses || courses.length === 0) {
      return res.status(404).json(new ApiResponse(404, [], 'No PE courses found.'));
    }

    // Format the PE courses and student details for the frontend
    const formattedCourses = courses.map(course => ({
      courseCode: course.courseCode,
      courseName: course.courseName,
      branch: course.branch,
      students: course.students.map(student => ({
        userId: student._id,
        rollNumber: student.rollNumber,
        fullName: student.fullName,
        branch: student.branch,
        section: student.section,
      })),
    }));

    // console.log('Formatted PE Courses:', formattedCourses); // Debugging

    return res.status(200).json(new ApiResponse(200, formattedCourses, 'PE courses fetched successfully.'));
  } catch (error) {
    console.error('Error fetching PE courses:', error);
    return res.status(500).json(new ApiResponse(500, null, 'An error occurred while fetching PE courses.'));
  }
});


export const getUserPeCourses = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('peCourses');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found!' });
    }

    res.status(200).json({ success: true, data: user.peCourses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error, try again later.' });
  }
};