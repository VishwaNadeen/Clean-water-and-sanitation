import express from "express";
import { devAdmin } from "../middleware/devAdmin.js";
import {
    createRestroom,
    deleteRestroom,
    getNearbyRestrooms,
    getRestroomById,
    getRestrooms,
    updateRestroom,
} from "../controllers/restroomController.js";

const router = express.Router();

//public 
router.get("/", getRestrooms);
router.get("/nearby", getNearbyRestrooms);
router.get("/:id", getRestroomById);

// admin (dev-only)
router.post("/", devAdmin, createRestroom);
router.put("/:id", devAdmin, updateRestroom);
router.delete("/:id", devAdmin, deleteRestroom);

export default router;


