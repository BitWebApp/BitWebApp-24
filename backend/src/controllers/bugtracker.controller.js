import { BugTracker } from '../models/bugtracker.model.js';
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { asyncHandler } from '../utils/asyncHandler.js';

export const createBug = asyncHandler(async (req, res) => {
  const { title, reportDescription } = req.body;
  if (!title || !reportDescription) {
    throw new Error("Title and report description are required.");
  }
  const links = [];
  if (req.files && req.files.length) {
    for (const file of req.files) {
      const response = await uploadOnCloudinary(file.path);
      if (response) {
        links.push(response.secure_url);
      }
    }
  }
  const bug = await BugTracker.create({
    title,
    reportDescription,
    reporter: 
	{ 
		kind: req.user.role || "User", 
		id: req.user._id 
	},
    links
  });
  res.status(201).json({ success: true, data: bug });
});

export const getBugs = async (req, res) => {
	try {
		const bugs = await BugTracker.find();
		res.json(bugs);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getBugById = async (req, res) => {
	try {
		const bug = await BugTracker.findById(req.params.id);
		if (!bug) return res.status(404).json({ message: 'Bug not found' });
		res.json(bug);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateBug = async (req, res) => {
	try {
		const { status } = req.body;
		const bug = await BugTracker.findByIdAndUpdate(
			req.params.id,
			{ status },
			{ new: true, runValidators: true }
		);
		if (!bug) return res.status(404).json({ message: 'Bug not found' });
		res.json(bug);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};