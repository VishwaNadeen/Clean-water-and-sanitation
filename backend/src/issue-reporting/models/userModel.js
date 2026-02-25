import mongoose from "mongoose";

// Minimal placeholder User model - will be replaced by team member
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            default: "User"
        },
        email: {
            type: String,
            required: true,
            default: "user@example.com"
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);
export default User;