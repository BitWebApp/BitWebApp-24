import fs from "fs";
import path from "path";

// Local file storage replacement for Cloudinary.
// Files will be moved to ./public/uploads and served by express.static("public").

const uploadsDir = path.resolve(process.cwd(), "public", "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const makePublicUrl = (filename) => {
  const base = (process.env.BASE_URL || process.env.SERVER_URL || "").replace(/\/+$/g, "");
  const urlPath = `/uploads/${filename}`;
  console.log("Generated public URL:", base ? `${base}${urlPath}` : urlPath);
  return base ? `${base}${urlPath}` : urlPath;
};

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const originalName = path.basename(localFilePath);
    const timestamp = Date.now();
    const filename = `${timestamp}_${originalName}`;
    const destPath = path.join(uploadsDir, filename);

    // Move the file from its current location to uploads directory
    await fs.promises.rename(localFilePath, destPath);

    console.log("File moved to uploads:", makePublicUrl(filename));

    const response = {
      secure_url: makePublicUrl(filename),
      public_id: filename.split(".")[0],
      local_path: destPath,
      url: makePublicUrl(filename),
    };

    console.log("File saved locally:", response.secure_url);
    return response;
  } catch (error) {
    console.error("uploadOnCloudinary() failed (local storage):", error);
    // try to clean up the temporary file if it still exists
    try {
      if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
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

    // Find files in uploadsDir whose basename (without extension) matches publicId
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
    console.error("Error deleting file from local storage:", error);
    throw error;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
