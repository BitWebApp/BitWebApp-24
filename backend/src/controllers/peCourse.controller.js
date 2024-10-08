import { PeCourse } from '../models/peCourse.model.js';
import { User } from '../models/user.model.js';

export const addPeCourse = async (req, res) => 
    {
        try 
        {
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

export const getAllPeCourses = async (req, res) => {
  try {
    const courses = await PeCourse.find();
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error, try again later.' });
  }
};

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