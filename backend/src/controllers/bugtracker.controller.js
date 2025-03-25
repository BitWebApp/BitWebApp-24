import { ClassroomBooking as BugTracker } from '../models/bugtracker.model.js';

export const createBug = async (req, res) => {
	try {
		const { reportDescription, requesterType } = req.body;
		const reporter = {
			kind: requesterType,
			id: req.user._id
		};
		const bug = new BugTracker({ reporter, reportDescription });
		await bug.save();
		res.status(201).json(bug);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

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