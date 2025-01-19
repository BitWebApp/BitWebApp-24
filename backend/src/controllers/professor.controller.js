import { Professor } from '../models/professor.model.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const addProf = asyncHandler(async (req, res) => {
    const { idNumber, fullName, contact } = req.body;

    if (!idNumber || !fullName || !contact) {
        throw new ApiError(400, "All fields (idNumber, fullName, contact) are required!");
    }

    const existingProfessor = await Professor.findOne({ idNumber });
    if (existingProfessor) {
        throw new ApiError(409, "Professor with this ID number already exists!");
    }

    const professor = await Professor.create({ idNumber, fullName, contact });
    res.status(201).json(new ApiResponse(200, "Professor added successfully!", professor));
});

const getProf = asyncHandler(async (req, res) => {
    const professors = await Professor.find();
    res.status(200).json(new ApiResponse(200, "All professors fetched successfully!", professors));
});

export { addProf, getProf };
