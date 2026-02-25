import mongoose from "mongoose";

// Minimal placeholder Restroom model - will be replaced by team member
const restroomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            default: "Restroom"
        },
        location: {
            type: String,
            required: true,
            default: "Building A"
        }
    },
    {
        timestamps: true
    }
);

const Restroom = mongoose.model("Restroom", restroomSchema);
export default Restroom;