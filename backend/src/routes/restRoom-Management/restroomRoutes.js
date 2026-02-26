import express from "express";
//import { devAdmin } from "../../middleware/devAdmin.js";
import {
    createRestroom,
    deleteRestroom,
    getNearbyRestrooms,
    getRestroomById,
    getRestrooms,
    updateRestroom,
} from "../../controllers/restRoom-Management/restroomController.js";
import { protect, authorizeRoles } from "../../middleware/authMiddleware.js";

const router = express.Router();

//public 
router.get("/", getRestrooms);
router.get("/nearby", getNearbyRestrooms);
router.get("/:id", getRestroomById);

// admin (dev-only)
router.post("/", protect, authorizeRoles("ADMIN"), createRestroom);
router.put("/:id", protect, authorizeRoles("ADMIN"), updateRestroom);
router.delete("/:id", protect, authorizeRoles("ADMIN"), deleteRestroom);



export default router;


