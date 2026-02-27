import cloudinary from '../../config/cloudinary.js';
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
        // Add validation
        if (!fileBuffer) {
            reject(new Error('File buffer is required'));
            return;
        }

        if (!originalName) {
            reject(new Error('Original filename is required'));
            return;
        }

        const sanitizedFileName = originalName.replace(/[^a-zA-Z0-9.]/g, '_');
        
        const uploadOptions = {
            resource_type: 'auto',
            folder: 'issue_reports',
            public_id: `issue_${Date.now()}_${sanitizedFileName.split('.')[0]}`,
        };
        
        cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(new Error(`Cloudinary upload failed: ${error.message || 'Unknown error'}`));
                } else {
                    console.log('Upload successful:', result.secure_url);
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