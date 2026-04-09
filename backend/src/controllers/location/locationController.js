/**
 * locationController.js
 *
 * Exposes Province, District, City data from the database as public API endpoints.
 * This data is already seeded by the issue-reporting module's locationSeeder.
 * We reuse the same models — no duplication.
 *
 * Endpoints (all public — no auth needed):
 *   GET /api/locations/provinces              → all provinces
 *   GET /api/locations/districts?provinceId=  → districts under a province
 *   GET /api/locations/cities?districtId=&q=  → cities under a district, optional search
 */

import Province from "../../models/issue-reporting/provinceModel.js";
import District from "../../models/issue-reporting/districtModel.js";
import City     from "../../models/issue-reporting/cityModel.js";

// GET /api/locations/provinces
export const getProvinces = async (req, res, next) => {
  try {
    // Return all provinces sorted alphabetically
    const provinces = await Province.find({}).sort({ name: 1 }).lean();
    res.json(provinces);
  } catch (err) {
    next(err);
  }
};

// GET /api/locations/districts?provinceId=xxx
export const getDistricts = async (req, res, next) => {
  try {
    const { provinceId } = req.query;

    if (!provinceId) {
      return res.status(400).json({ message: "provinceId is required" });
    }

    // Only return districts that belong to the selected province
    const districts = await District.find({ provinceId }).sort({ name: 1 }).lean();
    res.json(districts);
  } catch (err) {
    next(err);
  }
};

// GET /api/locations/cities?districtId=xxx&q=search
export const getCities = async (req, res, next) => {
  try {
    const { districtId, q } = req.query;

    if (!districtId) {
      return res.status(400).json({ message: "districtId is required" });
    }

    const filter = { districtId };

    // Optional search — case-insensitive partial match on city name
    // Used for the type-ahead input on the admin form
    if (q && q.trim()) {
      filter.name = { $regex: q.trim(), $options: "i" };
    }

    const cities = await City.find(filter).sort({ name: 1 }).limit(20).lean();
    res.json(cities);
  } catch (err) {
    next(err);
  }
};
