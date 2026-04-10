// src/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config({ quiet: true });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export default cloudinary;

