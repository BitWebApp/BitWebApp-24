import mongoose, { Schema } from "mongoose";

const BugTrackerSchema = new Schema({
	reporter: {
		kind: { type: String, required: true, enum: ['User', 'Faculty'] },
		id: { type: Schema.Types.ObjectId, required: true, refPath: 'reporter.kind' }
	},
	status: {
		type: String,
		enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
		default: 'Open'
	},
	reportDescription: { type: String, required: true },
}, { timestamps: true });

export const ClassroomBooking = mongoose.model('BugTracker', BugTrackerSchema);
