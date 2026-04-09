/**
 * locationRoutes.js
 *
 * Public routes — no authentication needed.
 * Used by the admin restroom form dropdowns and the issue-reporting form.
 */

import express from "express";
import {
  getProvinces,
  getDistricts,
  getCities,
} from "../../controllers/location/locationController.js";

const router = express.Router();

router.get("/provinces", getProvinces);           // all provinces
router.get("/districts", getDistricts);           // districts by provinceId
router.get("/cities",    getCities);              // cities by districtId + optional search

export default router;
