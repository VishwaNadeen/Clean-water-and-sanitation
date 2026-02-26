// src/middleware/upload.js  (or whatever your file name is)

import cloudinary from '../../config/cloudinary.js';  // ✅ import existing config
import multer from 'multer';

// Simple multer configuration (store file in memory)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// Upload function to Cloudinary
export const uploadToCloudinary = (fileBuffer, originalName) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
                folder: 'issue_reports',
                public_id: `issue_${Date.now()}_${originalName.split('.')[0]}`,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                    });
                }
            }
        ).end(fileBuffer);
    });
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};