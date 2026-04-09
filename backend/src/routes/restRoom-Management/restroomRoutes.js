import express from "express";
import {
    createRestroom,
    deleteRestroom,
    getNearbyRestrooms,
    getRestroomById,
    getRestrooms,
    updateRestroom,
} from "../../controllers/restRoom-Management/restroomController.js";
import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";
import multer from "multer"; // ← add this

// multer with memory storage — buffers uploaded files in RAM
// so we can pipe them directly to Cloudinary without saving to disk
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per image
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("Only image files are allowed"), false);
    },
});

const router = express.Router();

// public
router.get("/",        getRestrooms);
router.get("/nearby",  getNearbyRestrooms);
router.get("/:id",     getRestroomById);

// admin only — upload.array("images", 5) allows up to 5 images per restroom
router.post(  "/",    protect, authorizeRoles("ADMIN"), upload.array("images", 5), createRestroom);
router.put(   "/:id", protect, authorizeRoles("ADMIN"), upload.array("images", 5), updateRestroom);
router.delete("/:id", protect, authorizeRoles("ADMIN"), deleteRestroom);

export default router;
