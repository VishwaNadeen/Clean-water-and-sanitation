// src/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

console.log('Cloudinary Environment Variables:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
  api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET', 
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test the configuration
console.log('Cloudinary configured:', cloudinary.config());

export default cloudinary;

