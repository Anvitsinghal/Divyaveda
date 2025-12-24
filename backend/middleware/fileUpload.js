import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import "dotenv/config";

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Multer (Temp storage on server before uploading to Cloud)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure this folder exists or use /tmp
    const path = "./uploads";
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    cb(null, path);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage: storage });

// 3. Helper: Upload to Cloudinary & Delete local file
export const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "products" // Cloudinary folder name
    });
    
    // Remove file from local server after upload
    fs.unlinkSync(localFilePath);
    
    return response.secure_url;
  } catch (error) {
    // Remove file even if upload failed
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};