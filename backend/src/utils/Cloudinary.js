import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "raw",
    });
    console.log("File uploaded on Cloudinary");
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error("Public ID is required");
    }

    const deletionResponse = await cloudinary.uploader.destroy(publicId);

    if (deletionResponse.result === "not found") {
      console.log(`File with public ID ${publicId} not found on Cloudinary`);
    } else if (deletionResponse.result !== "ok") {
      throw new Error(`Failed to delete file from Cloudinary: ${deletionResponse.result}`);
    } else {
      console.log(`File deleted from Cloudinary: ${publicId}`);
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw error;
  }
};


export { uploadOnCloudinary, deleteFromCloudinary };
