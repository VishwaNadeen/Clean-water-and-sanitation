import express from "express";
import {
  getCitiesByDistrict,
  getDistrictsByProvince,
  getProvinces,
} from "../../controllers/issue-reporting/locationController.js";

const router = express.Router();

router.get("/provinces", getProvinces);
router.get("/provinces/:provinceId/districts", getDistrictsByProvince);
router.get("/districts/:districtId/cities", getCitiesByDistrict);

export default router;
