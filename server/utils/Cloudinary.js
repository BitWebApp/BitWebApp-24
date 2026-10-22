import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import util from "util";
import { uploadsDir } from "./storagePaths.js";

const isCloudinaryConfigured = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return Boolean(
    cloudName &&
    apiKey &&
    apiSecret &&
    !cloudName.includes("your-cloud-name") &&
    !apiKey.includes("your-api-key") &&
    !apiSecret.includes("your-api-secret")
  );
};

const getCloudinaryClient = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
};

const makePublicUrl = (filename) => {
  const base = (process.env.BASE_URL || process.env.SERVER_URL || "").replace(
    /\/+$/g,
    ""
  );
  const urlPath = `/uploads/${filename}`;
  return base ? `${base}${urlPath}` : urlPath;
};

const uploadOnCloudinary = async (localFilePath, options = {}) => {
  try {
    if (!localFilePath) return null;

    // Resolve to absolute path
    const absolutePath = path.isAbsolute(localFilePath)
      ? localFilePath
      : path.resolve(localFilePath);

    // Check if source file exists
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Source file not found: ${absolutePath}`);
    }

    // 1. If Cloudinary is configured, upload to Cloudinary CDN
    if (isCloudinaryConfigured()) {
      const client = getCloudinaryClient();
      const uploadOptions = {
        resource_type: "auto",
        folder: "bitacademia",
        ...(typeof options === "object" ? options : {}),
      };

      const response = await client.uploader.upload(
        absolutePath,
        uploadOptions
      );

      // Clean up the temporary local file after successful upload
      try {
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      } catch (unlinkErr) {
        console.warn("Could not delete temporary file:", unlinkErr?.message);
      }

      console.log("File uploaded to Cloudinary:", response.secure_url);
      return {
        secure_url: response.secure_url,
        url: response.secure_url,
        public_id: response.public_id,
        local_path: null,
      };
    }

    // 2. Fallback: Local storage (for offline or local dev without Cloudinary keys)
    const originalName = path.basename(absolutePath);
    const timestamp = Date.now();
    const filename = `${timestamp}_${originalName}`;
    const destPath = path.join(uploadsDir, filename);

    try {
      await fs.promises.rename(absolutePath, destPath);
    } catch (moveErr) {
      if (moveErr && moveErr.code === "EXDEV") {
        await fs.promises.copyFile(absolutePath, destPath);
        await fs.promises.unlink(absolutePath);
      } else {
        throw moveErr;
      }
    }

    const publicUrl = makePublicUrl(filename);
    console.log("File saved to local storage:", publicUrl);

    return {
      secure_url: publicUrl,
      public_id: filename.split(".")[0],
      local_path: destPath,
      url: publicUrl,
    };
  } catch (error) {
    console.error("uploadOnCloudinary() failed:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
      inspect: util.inspect(error, { depth: 3 }),
    });

    // Clean up temporary file if it still exists
    try {
      const abs = localFilePath
        ? path.isAbsolute(localFilePath)
          ? localFilePath
          : path.resolve(localFilePath)
        : undefined;
      if (abs && fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch (e) {
      // ignore
    }

    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error("Public ID is required");
    }

    // If Cloudinary is configured, delete from Cloudinary
    if (isCloudinaryConfigured()) {
      const client = getCloudinaryClient();
      let deletionResponse = await client.uploader.destroy(publicId);
      if (deletionResponse?.result === "not found") {
        deletionResponse = await client.uploader.destroy(publicId, {
          resource_type: "raw",
        });
      }
      console.log(
        `Cloudinary deletion response for ${publicId}:`,
        deletionResponse
      );
      return deletionResponse;
    }

    // Local storage fallback
    const files = await fs.promises.readdir(uploadsDir);
    const matches = files.filter((f) => path.parse(f).name === publicId);

    if (matches.length === 0) {
      console.log(`File with public ID ${publicId} not found in local uploads`);
      return { result: "not found" };
    }

    for (const file of matches) {
      const p = path.join(uploadsDir, file);
      try {
        await fs.promises.unlink(p);
        console.log(`Deleted local file: ${p}`);
      } catch (err) {
        console.error(`Failed to delete local file ${p}:`, err);
      }
    }

    return { result: "ok" };
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
