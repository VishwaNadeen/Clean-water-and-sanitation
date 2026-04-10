import mongoose from "mongoose";

const restroomRatingSchema = new mongoose.Schema(
  {
    restroomId: { type: mongoose.Schema.Types.ObjectId, ref: "Restroom", required: true },
    // login doc id — one rating per account
    loginId:    { type: mongoose.Schema.Types.ObjectId, ref: "Login",    required: true },
    rating:     { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

// unique per user per restroom
restroomRatingSchema.index({ restroomId: 1, loginId: 1 }, { unique: true });

export default mongoose.model("RestroomRating", restroomRatingSchema);
