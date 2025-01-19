import { Professor } from '../models/professor.model.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addProf = asyncHandler(async(req, res) => {
    const {idNumber, fullName, contact, joining_date, published_papers} = req.body
})

const getProf = asyncHandler(async(req, res) => {

})