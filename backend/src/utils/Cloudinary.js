import fs from "fs";
import path from "path";
import util from "util";

// Local file storage replacement for Cloudinary.
// Files will be moved to ./public/uploads and served by express.static("public").

const uploadsDir = path.resolve(process.cwd(), "public", "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const makePublicUrl = (filename) => {
  const base = (process.env.BASE_URL || process.env.SERVER_URL || "").replace(
    /\/+$/g,
    ""
  );
  const urlPath = `/uploads/${filename}`;
  console.log("Generated public URL:", base ? `${base}${urlPath}` : urlPath);
  return base ? `${base}${urlPath}` : urlPath;
};

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Resolve to absolute path
    const absolutePath = path.isAbsolute(localFilePath)
      ? localFilePath
      : path.resolve(process.cwd(), localFilePath);

    // Check if source file exists
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Source file not found: ${absolutePath}`);
    }

    const originalName = path.basename(absolutePath);
    const timestamp = Date.now();
    const filename = `${timestamp}_${originalName}`;
    const destPath = path.join(uploadsDir, filename);

    // Move the file - handle cross-device EXDEV by copying+unlinking
    try {
      await fs.promises.rename(absolutePath, destPath);
    } catch (moveErr) {
      // If EXDEV (cross-device link), fallback to copy + unlink
      if (moveErr && moveErr.code === "EXDEV") {
        console.warn(
          "fs.rename EXDEV encountered; falling back to copy + unlink"
        );
        await fs.promises.copyFile(absolutePath, destPath);
        await fs.promises.unlink(absolutePath);
      } else {
        throw moveErr;
      }
    }

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
    // Detailed logging so you can copy exact error
    try {
      const abs = localFilePath
        ? path.isAbsolute(localFilePath)
          ? localFilePath
          : path.resolve(process.cwd(), localFilePath)
        : undefined;

      console.error("uploadOnCloudinary() failed (local storage):", {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
        sourcePath: abs,
        inspect: util.inspect(error, { depth: 3 }),
      });
    } catch (logErr) {
      console.error("Failed to log upload error:", logErr);
    }

    // try to clean up the temporary file if it still exists
    try {
      const abs = localFilePath
        ? path.isAbsolute(localFilePath)
          ? localFilePath
          : path.resolve(process.cwd(), localFilePath)
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
