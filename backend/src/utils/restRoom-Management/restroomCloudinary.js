/**
 * restroomCloudinary.js
 *
 * Cloudinary upload/delete helpers specifically for restroom images.
 * Follows the same pattern as utils/issue-reporting/cloudinary.js
 * but stores files in the "restrooms" Cloudinary folder.
 */

import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";

/**
 * Upload a file buffer to Cloudinary under the "restrooms" folder.
 * Uses streamifier to pipe the buffer as a stream (no temp files needed).
 *
 * @param {Buffer} buffer       - file buffer from multer memoryStorage
 * @param {string} originalName - original filename (used to build public_id)
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadRestroomImage = (buffer, originalName) => {
    return new Promise((resolve, reject) => {
        if (!buffer)       return reject(new Error("File buffer is required"));
        if (!originalName) return reject(new Error("Original filename is required"));

        // Sanitise filename — remove special chars that Cloudinary dislikes
        const sanitized = originalName.replace(/[^a-zA-Z0-9.]/g, "_");

        const uploadOptions = {
            resource_type: "auto",
            folder: "restrooms",   // separate Cloudinary folder from issues/staff
            public_id: `restroom_${Date.now()}_${sanitized.split(".")[0]}`,
        };

        // streamifier converts a Buffer into a readable stream for upload_stream
        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error("Cloudinary restroom upload error:", error);
                    return reject(new Error(`Upload failed: ${error.message}`));
                }
                resolve({
                    url:      result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

/**
 * Delete a restroom image from Cloudinary by its public_id.
 * Called when a restroom is deleted or an image is removed.
 *
 * @param {string} publicId - Cloudinary public_id stored in the database
 */
export const deleteRestroomImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Error deleting restroom image from Cloudinary:", error);
        throw error;
    }
};
