import mongoose from "mongoose";
import Restroom from "../../models/restRoom-Management/Restroom.js";
import RestroomRating from "../../models/restRoom-Management/RestroomRating.js";

// POST /:id/rate — submit a rating, locked after first submission
export const submitRating = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const restroomId = req.params.id;
    const loginId    = req.auth._id; // login doc id, unique per account

    const num = Number(rating);
    if (!num || num < 1 || num > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // block duplicate ratings
    const existing = await RestroomRating.findOne({ restroomId, loginId });
    if (existing) {
      return res.status(409).json({ message: "You have already rated this restroom." });
    }

    await RestroomRating.create({ restroomId, loginId, rating: num });

    // recalculate avg and count via aggregation
    const [stats] = await RestroomRating.aggregate([
      { $match: { restroomId: new mongoose.Types.ObjectId(restroomId) } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    // update restroom document with new avg and count
    await Restroom.findByIdAndUpdate(restroomId, {
      avgRating:   parseFloat(stats.avg.toFixed(1)),
      ratingCount: stats.count,
    });

    res.status(201).json({ message: "Rating submitted.", rating: num });
  } catch (err) {
    next(err);
  }
};

// GET /:id/my-rating — returns the current user's rating or null
export const getMyRating = async (req, res, next) => {
  try {
    const restroomId = req.params.id;
    const loginId    = req.auth._id;

    const existing = await RestroomRating.findOne({ restroomId, loginId });
    res.json({ rating: existing ? existing.rating : null });
  } catch (err) {
    next(err);
  }
};
