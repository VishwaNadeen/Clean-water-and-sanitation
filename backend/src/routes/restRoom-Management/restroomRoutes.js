import express from "express";
import {
    createRestroom,
    deleteRestroom,
    getNearbyRestrooms,
    getRestroomById,
    getRestrooms,
    updateRestroom,
} from "../../controllers/restRoom-Management/restroomController.js";
// rating controllers
import { submitRating, getMyRating } from "../../controllers/restRoom-Management/restroomRatingController.js";
import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";
import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
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

// admin
router.post(  "/",    protect, authorizeRoles("ADMIN"), upload.array("images", 5), createRestroom);
router.put(   "/:id", protect, authorizeRoles("ADMIN"), upload.array("images", 5), updateRestroom);
router.delete("/:id", protect, authorizeRoles("ADMIN"), deleteRestroom);

// ratings — any logged-in user
router.post("/:id/rate",      protect, submitRating);
router.get( "/:id/my-rating", protect, getMyRating);

export default router;
