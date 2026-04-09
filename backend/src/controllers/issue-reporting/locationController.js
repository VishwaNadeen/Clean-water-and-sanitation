import mongoose from "mongoose";
import Province from "../../models/issue-reporting/provinceModel.js";
import District from "../../models/issue-reporting/districtModel.js";
import City from "../../models/issue-reporting/cityModel.js";

export const getProvinces = async (req, res) => {
  try {
    const provinces = await Province.find({}).sort({ name: 1 });

    res.json({
      success: true,
      data: provinces,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching provinces",
      error: error.message,
    });
  }
};

export const getDistrictsByProvince = async (req, res) => {
  try {
    const { provinceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(provinceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid province ID format.",
      });
    }

    const districts = await District.find({ provinceId }).sort({ name: 1 });

    res.json({
      success: true,
      data: districts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching districts",
      error: error.message,
    });
  }
};

export const getCitiesByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(districtId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid district ID format.",
      });
    }

    const cities = await City.find({ districtId }).sort({ name: 1 });

    res.json({
      success: true,
      data: cities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching cities",
      error: error.message,
    });
  }
};
