import { ApiError } from "../utils/ApiError.js"
import jwt, { decode } from "jsonwebtoken"
import { asyncHandler } from "../utils/asynchandler.js"

export const verifyJWT = asyncHandler(async(req, res, next) =>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
        if(!token){
            throw new ApiError(401, "Unauthorised request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const flat = await Flat.findById(decodedToken?._id).select("-password -refreshToken")
        if(!flat){
            throw new ApiError(401, "Invalid Access Token")
        }
        req.flat = flat
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})